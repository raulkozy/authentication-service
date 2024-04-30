import { CommonHeadersDTO } from '@common/dto/headers.dto';
import {
  JWT_STEPUP_AUTH_VERIFICATION_SECRET,
  JWT_STEPUP_AUTH_VERIFICATION_TOKEN_EXPIRES_TIME,
  STEPUP_EMAIL_OTP_VERIFICATION_TEMPLATE_CODE,
  STEPUP_PHONE_OTP_VERIFICATION_TEMPLATE_CODE,
  USER_LOGIN_REPOSITORY,
} from '@constant/provider';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import {
  CreateSessionResponseDTO,
  SessionTokenDTO,
  StepupRequestDTO,
  StepupResponseDTO,
} from '../model/dto/stepup.dto';
import {
  ActionTypeEnum,
  ChannelEnum,
  CheckStatusEnum,
  StatusEnum,
  TransactionTypeEnum,
  VerficationMethodEnum,
  VerificationStatusEnum,
} from '../model/enum/index';
import * as moment from 'moment';
import { JwtService } from '@nestjs/jwt';
import { StepupSessionEntity } from '../entity/stepup-session.entity';
import {
  ER_EMAIL_API_GLOBAL,
  ER_INVALID_STEPUP_SESSION,
  ER_NOT_VERIDIUM_USER,
  ER_SMS_API_GLOBAL,
  ER_STEPUP_GLOBAL,
  ER_STEPUP_VERIDIUM,
  ER_STEPUP_VERIDIUM_UNAUTHORIZE,
} from '../stepup-authentication.error';
import { UserLoginEntity } from '@module/auth/entity/user-login.entity';
import { AxiosHttpService } from '@module/http/http.service';
import { JWT_ISS } from '@constant/jwt';
import { ER_GET_CUSTOMER } from '@adapter/miroservice/customer/customer.error';
import {
  CURRENCY_MS_URL,
  NOTIFICATION_MS_URL,
  VERIDIUM_CHECK_SESSION_API_URL,
  VERIDIUM_CREATE_SESSION_API_URL,
} from '@constant/url';
import { PaymentContract } from '@common/contract/payment/payment.contract';
import { CustomerContract } from '@common/contract/customer/customer.contract';

@Injectable()
export class StepupAuthenticationService {
  constructor(
    @Inject(USER_LOGIN_REPOSITORY)
    private readonly _userLoginRepository: Repository<UserLoginEntity>,
    @Inject('STEPUP_SESSION_REPOSITORY')
    private readonly _stepupSessionRepository: Repository<StepupSessionEntity>,
    private readonly _config: ConfigService,
    private readonly _http: AxiosHttpService,
    private readonly _jwtService: JwtService,
    private readonly _paymentContract: PaymentContract,
    private readonly _customerContract: CustomerContract,
  ) {}

  rules = {
    MOB: {
      geoLocationCheck: true,
      firstLoginAfterUnlock: true,
      addBeneficiary: true,
      firstTransactionToBeneficiary: true,
      transactionLimitCheck: true,
      randomStepupAuth: true,
      randomStepupAuthIntervalInDays: 3,
      forceStepupOnTransactionIfPreviousFaild: true,
      transactionBetweenAccountIntervalCheck: true,
      transactionBetweenAccountIntervalInDays: 90,
    },
    WEB: {
      geoLocationCheck: true,
      firstLoginAfterUnlock: true,
      addBeneficiary: true,
      firstTransactionToBeneficiary: true,
      transactionLimitCheck: true,
      randomStepupAuth: true,
      randomStepupAuthIntervalInDays: 3,
      forceStepupOnTransactionIfPreviousFaild: true,
      transactionBetweenAccountIntervalCheck: true,
      transactionBetweenAccountIntervalInDays: 90,
    },
    LIMIT: {
      forceStepup: true,
      currency: 'USD',
      self: true,
      selfLimit: 2000,
      withinBank: true,
      withinBankLimit: 1500,
      externalBank: true,
      externalBankLimit: 1000,
    },
    VERIFICATION_METHODS: {
      EMAIL: false,
      PHONE: true,
      VERIDIUM: false,
      RSA: false,
    },
    OTHER_VERIFICATION_METHOD: {
      EMAIL: true,
      PHONE: true,
      VERIDIUM: true,
      RSA: false,
    },
  };

  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    headers: CommonHeadersDTO,
  ) {
    const url = encodeURI(
      `${CURRENCY_MS_URL()}/exchange?currencies=${fromCurrency},${toCurrency}`,
    );
    const result = await this._http.get(url, {
      headers: { Authorization: headers['authorization'] },
    });

    if (result && result.statusCode && result.statusCode !== 200) {
      Logger.error('Currency service response', result);
      throw new InternalServerErrorException('Unable to fetch currency rates');
    }
    if (
      result?.data[fromCurrency] &&
      result?.data[fromCurrency][0]?.code === toCurrency
    ) {
      const toCurrencyValue = parseFloat(result.data[fromCurrency][0].value);

      return amount * toCurrencyValue;
    } else {
      throw new InternalServerErrorException('Unable to fetch currency rates');
    }
  }

  Rand(min, max) {
    const random = Math.random();
    return Math.floor(random * (max - min) + min);
  }

  GenerateOTP(length) {
    let otp = '';
    while (length) {
      otp += this.Rand(0, 9);
      length--;
    }
    return otp;
  }

  async stepupAuthenticationCheck(
    CUSTOMER_ID: string,
    Channel: ChannelEnum,
    data: StepupRequestDTO,
    headers: CommonHeadersDTO,
  ): Promise<StepupResponseDTO> {
    try {
      //check for all step up rules

      const { action } = data;
      /**Session data */
      const sessionData = await this._userLoginRepository.findOne({
        where: { session_id: headers['SESSION_ID'] },
      });

      if (!sessionData) throw new UnauthorizedException('Invalid session');

      //check if session is already verified
      if (
        sessionData.stepup_auth_status === VerificationStatusEnum.Verified &&
        !this.rules.LIMIT.forceStepup
      ) {
        return {
          check: CheckStatusEnum.pass,
          message: 'session already verified',
          verification_method: VerficationMethodEnum.PHONE,
        };
      } else if (data.session) {
        //get session from database
        const stepUpSession = await this._stepupSessionRepository.findOne({
          where: { id: data.session, status: StatusEnum.Active },
        });

        if (!stepUpSession) {
          throw new ForbiddenException('Invalid session');
        }

        if (stepUpSession.action_type !== ActionTypeEnum[data.action]) {
          throw new BadRequestException({
            message: 'invalid action for this session!',
          });
        }

        try {
          //check for token expiry
          await this._jwtService.verifyAsync(stepUpSession.token, {
            secret: JWT_STEPUP_AUTH_VERIFICATION_SECRET(),
            subject: 'stepup-verification-token',
            audience: 'Customer',
            algorithms: ['HS256'],
            issuer: JWT_ISS(),
          });
        } catch (err) {
          throw new ForbiddenException(ER_INVALID_STEPUP_SESSION);
        }

        const tokenData = await this._jwtService.decode(stepUpSession.token);

        if (
          data.verification_method === VerficationMethodEnum.PHONE &&
          tokenData['data']['PHONE_OTP']
        ) {
          if (tokenData['data']['PHONE_OTP'] !== data.otp) {
            return {
              check: CheckStatusEnum.fail,
              message: 'invalid otp!',
            };
          }
        } else if (
          data.verification_method === VerficationMethodEnum.EMAIL_OTP &&
          tokenData['data']['EMAIL_OTP']
        ) {
          if (tokenData['data']['EMAIL_OTP'] !== data.otp) {
            return {
              check: CheckStatusEnum.fail,
              message: 'invalid otp!',
            };
          }
        } else if (
          data.verification_method === VerficationMethodEnum.VERIDIUM &&
          tokenData['data']['VERIDIUM_SESSION_ID']
        ) {
          //call veridium to fetch session status
          const result = await this._http.get(
            `${VERIDIUM_CHECK_SESSION_API_URL(
              tokenData['data']['VERIDIUM_SESSION_ID'],
            )}`,
          );

          if (
            !result ||
            !result.statusCode ||
            result.statusCode !== 200 ||
            result?.data?.error?.errorCode !== 0
          ) {
            Logger.error('auth service response', result);
            throw new ForbiddenException(ER_STEPUP_VERIDIUM);
          } else if (!result?.data?.biometricAuthenticationResult) {
            Logger.error('auth service response', result);
            throw new ForbiddenException(ER_STEPUP_VERIDIUM_UNAUTHORIZE);
          } else if (result?.data?.biometricAuthenticationResult === 'FAILED') {
            //update user login database
            await this._userLoginRepository.update(
              {
                session_id: headers['SESSION_ID'],
              },
              {
                stepup_auth_status: VerificationStatusEnum.Failed,
              },
            );
            return {
              check: CheckStatusEnum.fail,
              message: result?.data?.biometricAuthenticationResult,
            };
          } else if (
            result?.data?.biometricAuthenticationResult !== 'AUTHENTICATED'
          ) {
            //falied
            return {
              check: CheckStatusEnum.fail,
              message: result?.data?.biometricAuthenticationResult,
            };
          }
        } else {
          return {
            check: CheckStatusEnum.fail,
            message: 'invalid verification method!',
          };
        }

        await this._stepupSessionRepository.update(
          { id: data.session },
          { status: StatusEnum.Inactive },
        );

        await this._userLoginRepository.query(
          `UPDATE "USER_LOGIN" SET 
          "last_stepup_auth_date" = CURRENT_TIMESTAMP,
           "stepup_auth_status" = :0,
            "updated_at" = CURRENT_TIMESTAMP
             WHERE "session_id" IN (:1)`,
          [VerificationStatusEnum.Verified, headers['SESSION_ID']],
        );

        return { check: CheckStatusEnum.pass, message: 'success' };
      }

      if (sessionData.stepup_auth_status !== VerificationStatusEnum.Failed)
        await this._userLoginRepository.update(
          {
            session_id: headers['SESSION_ID'],
          },
          { stepup_auth_status: VerificationStatusEnum.Pending },
        );

      if (action === ActionTypeEnum.login) {
        //LOGIN
        if (this.rules[Channel]['geoLocationCheck']) {
          Logger.log('checking for geolocation');
        }
        if (this.rules[Channel]['firstLoginAfterUnlock']) {
          /**Note: on account lock make stepup_auth_status to failed */
          Logger.log('checking for firstLoginAfterUnlock');
          if (
            sessionData.stepup_auth_status === VerificationStatusEnum.Failed
          ) {
            const session = await this.createSteupSession(
              CUSTOMER_ID,
              ActionTypeEnum.login,
            );
            return {
              check: CheckStatusEnum.fail,
              message: 'force step up',
              ...session,
            };
          }
        }
        return { check: CheckStatusEnum.pass, message: 'success' };
      } else if (action === ActionTypeEnum.addBeneficiary) {
        //BENEFICIARY

        /** forceStepupOnTransactionIfPreviousFaild */
        if (
          this.rules[Channel]['forceStepupOnTransactionIfPreviousFaild'] &&
          sessionData.stepup_auth_status === VerificationStatusEnum.Failed
        ) {
          const session = await this.createSteupSession(
            CUSTOMER_ID,
            ActionTypeEnum.addBeneficiary,
          );

          return {
            check: CheckStatusEnum.fail,
            message: 'force step up',
            ...session,
          };
        }

        if (this.rules[Channel]['addBeneficiary']) {
          Logger.log('checking for addBeneficiary');

          const session = await this.createSteupSession(
            CUSTOMER_ID,
            ActionTypeEnum.addBeneficiary,
          );

          return {
            check: CheckStatusEnum.fail,
            message: 'no step up in active session',
            ...session,
          };
        }

        return { check: CheckStatusEnum.pass, message: 'success' };
      } else if (action === ActionTypeEnum.transaction) {
        //TRANSACTION

        /** forceStepupOnTransactionIfPreviousFaild */
        if (
          this.rules[Channel]['forceStepupOnTransactionIfPreviousFaild'] &&
          sessionData.stepup_auth_status === VerificationStatusEnum.Failed
        ) {
          const session = await this.createSteupSession(
            CUSTOMER_ID,
            ActionTypeEnum.transaction,
          );
          return {
            check: CheckStatusEnum.fail,
            message: 'force step up',
            ...session,
          };
        }

        if (
          this.rules[Channel]['randomStepupAuth'] &&
          this.rules[Channel]['randomStepupAuthIntervalInDays'] &&
          sessionData.last_stepup_auth_date !== null
        ) {
          Logger.log('checking for randomStepupAuth');
          const fromDate = moment(
            sessionData.last_stepup_auth_date,
            'M/D/YYYY',
          );
          const today = moment().format('M/D/YYYY');

          if (
            fromDate.diff(today, 'days') >
            this.rules[Channel]['randomStepupAuthIntervalInDays']
          ) {
            const session = await this.createSteupSession(
              CUSTOMER_ID,
              ActionTypeEnum.transaction,
            );
            return {
              check: CheckStatusEnum.fail,
              message: `last step up interval is more than ${this.rules[Channel]['randomStepupAuthIntervalInDays']} days`,
              ...session,
            };
          }
        }

        if (
          this.rules[Channel]['firstTransactionToBeneficiary'] ||
          this.rules[Channel]['transactionBetweenAccountIntervalCheck']
        ) {
          Logger.log('checking for firstTransactionToBeneficiary');
          const { beneficiary_account_number } = data;
          if (!beneficiary_account_number)
            throw new BadRequestException('No beneficiary account provided');

          //check in transaction data
          const lastTransaction = await this._paymentContract.GetLastTransactionToAccount(
            CUSTOMER_ID,
            data.account_number,
            data.beneficiary_account_number,
            this.rules[Channel]['transactionBetweenAccountIntervalInDays'],
          );

          if (
            (this.rules[Channel]['firstTransactionToBeneficiary'] ||
              (this.rules[Channel]['transactionBetweenAccountIntervalCheck'] &&
                this.rules[Channel][
                  'transactionBetweenAccountIntervalInDays'
                ])) &&
            lastTransaction === null
          ) {
            const session = await this.createSteupSession(
              CUSTOMER_ID,
              ActionTypeEnum.transaction,
            );

            return {
              check: CheckStatusEnum.fail,
              message: 'force stepup on transaction',
              ...session,
            };
          }
          /*
          if (
            this.rules[Channel]['transactionBetweenAccountIntervalCheck'] &&
            this.rules[Channel]['transactionBetweenAccountIntervalInDays'] &&
            lastTransaction !== null
          ) {
            //Update: update the logic to check it from transaction database
            const fromDate = moment(
              beneficiaryAccountData.last_transaction_date,
              'M/D/YYYY',
            );
            const today = moment().format('M/D/YYYY');

            if (
              fromDate.diff(today, 'days') >
              this.rules[Channel]['transactionBetweenAccountIntervalInDays']
            ) {
              const session = await this.createSteupSession(
                CUSTOMER_ID,
                ActionTypeEnum.transaction,
              );
              return {
                check: CheckStatusEnum.fail,
                message: `transaction between account interval is more than ${this.rules[Channel]['transactionBetweenAccountIntervalInDays']} days`,
                ...session,
              };
            }
          }
          */
        }

        if (this.rules[Channel]['transactionLimitCheck']) {
          Logger.log('checking for transactionLimitCheck');

          let amount = data.amount;

          if (data.currency !== this.rules.LIMIT.currency) {
            amount = await this.convertCurrency(
              data.amount,
              data.currency,
              this.rules.LIMIT.currency,
              headers,
            );
          }

          if (
            data.transaction_type === TransactionTypeEnum.SELF &&
            this.rules.LIMIT.self &&
            this.rules.LIMIT.selfLimit &&
            amount > this.rules.LIMIT.selfLimit
          ) {
            const session = await this.createSteupSession(
              CUSTOMER_ID,
              ActionTypeEnum.transaction,
            );

            return {
              check: CheckStatusEnum.fail,
              message: `transaction amount is more than ${this.rules.LIMIT.selfLimit}`,
              ...session,
            };
          } else if (
            data.transaction_type === TransactionTypeEnum.WITHINBANK &&
            this.rules.LIMIT.withinBank &&
            this.rules.LIMIT.withinBankLimit &&
            amount > this.rules.LIMIT.withinBankLimit
          ) {
            const session = await this.createSteupSession(
              CUSTOMER_ID,
              ActionTypeEnum.transaction,
            );

            return {
              check: CheckStatusEnum.fail,
              message: `transaction account is more than ${this.rules.LIMIT.withinBankLimit}`,
              ...session,
            };
          } else if (
            data.transaction_type === TransactionTypeEnum.EXTERNALBANK &&
            this.rules.LIMIT.externalBank &&
            this.rules.LIMIT.externalBankLimit &&
            amount > this.rules.LIMIT.externalBankLimit
          ) {
            const session = await this.createSteupSession(
              CUSTOMER_ID,
              ActionTypeEnum.transaction,
            );
            return {
              check: CheckStatusEnum.fail,
              message: `transaction account is more than ${this.rules.LIMIT.externalBankLimit}`,
              ...session,
            };
          }
        }

        return { check: CheckStatusEnum.pass, message: 'success' };
      } else {
        throw new BadRequestException('Invalid action!');
      }
    } catch (err) {
      if (
        err instanceof BadRequestException ||
        err instanceof ForbiddenException ||
        err instanceof UnauthorizedException
      )
        throw err;

      Logger.error(
        'error while stepup authentication check, error:',
        err.stack,
      );

      throw new InternalServerErrorException(ER_STEPUP_GLOBAL);
    }
  }

  async createSteupSession(
    CUSTOMER_ID,
    action_type: ActionTypeEnum,
  ): Promise<CreateSessionResponseDTO> {
    try {
      const SESSION_DATA = new SessionTokenDTO();
      SESSION_DATA.customerID = CUSTOMER_ID;
      //get customer

      const customer = await this._customerContract.GetCustomerById(
        CUSTOMER_ID,
      );
      if (!customer)
        throw new BadRequestException(ER_GET_CUSTOMER(CUSTOMER_ID));

      //create otp
      if (this.rules.VERIFICATION_METHODS.PHONE) {
        SESSION_DATA.PHONE_OTP = this.GenerateOTP(6);
      }

      if (this.rules.VERIFICATION_METHODS.EMAIL) {
        SESSION_DATA.EMAIL_OTP = this.GenerateOTP(6);
      }

      if (this.rules.VERIFICATION_METHODS.VERIDIUM) {
        //create veridium session
        // const result = await this._http.get(
        //     `${VERIDIUM_CREATE_SESSION_API_URL(CUSTOMER_ID)}`,
        // );

        const result = await this._http.get(
          `${VERIDIUM_CREATE_SESSION_API_URL('1kruh1kpi')}`,
        );
        if (
          !result ||
          !result.statusCode ||
          result.statusCode !== 200 ||
          result?.data?.error?.errorCode !== 0
        ) {
          Logger.error('auth service response', result);
          throw new ForbiddenException(ER_SMS_API_GLOBAL);
        } else if (result?.data?.error?.errorCode === 603) {
          Logger.error('auth service response', result);
          throw new ForbiddenException(ER_NOT_VERIDIUM_USER);
        } else if (!result?.data?.sessionId) {
          Logger.error('auth service response', result);
          throw new ForbiddenException(ER_SMS_API_GLOBAL);
        }
        SESSION_DATA.VERIDIUM_SESSION_ID = result.data.sessionId;
      }

      //create a verification token
      const token = await this._jwtService.sign(
        {
          data: SESSION_DATA,
        },
        {
          secret: JWT_STEPUP_AUTH_VERIFICATION_SECRET(),
          expiresIn: JWT_STEPUP_AUTH_VERIFICATION_TOKEN_EXPIRES_TIME(),
          header: {
            typ: 'JWT',
            alg: 'HS256',
          },
          algorithm: 'HS256',
          audience: 'Customer',
          mutatePayload: false,
          subject: 'stepup-verification-token',
          issuer: JWT_ISS(),
        },
      );

      //insert into database
      const sessionEntity = new StepupSessionEntity();

      sessionEntity.customer = CUSTOMER_ID;
      sessionEntity.status = StatusEnum.Active;
      sessionEntity.token = token;
      sessionEntity.action_type = action_type;

      await this._stepupSessionRepository.save(sessionEntity);

      //notify

      if (this.rules.VERIFICATION_METHODS.EMAIL) {
        Logger.log('send verification token over email');

        //send email
        const emailReqBody = {
          type: 'EMAIL',
          code: `${STEPUP_EMAIL_OTP_VERIFICATION_TEMPLATE_CODE()}`,
          metadata: {
            name: customer.first_name,
            invitationCode: SESSION_DATA.EMAIL_OTP,
          },
          email: customer.email,
        };

        const result = await this._http.post(
          `${NOTIFICATION_MS_URL()}/notification/directTransaction`,
          emailReqBody,
        );

        if (result && result.statusCode && result.statusCode !== 201) {
          Logger.error('Notification service response', result);
          throw new InternalServerErrorException(ER_EMAIL_API_GLOBAL);
        }

        return {
          session: sessionEntity.id,
          verification_method: VerficationMethodEnum.EMAIL_OTP,
        };
      }

      if (this.rules.VERIFICATION_METHODS.PHONE) {
        Logger.log('send verification token over sms');

        //send OTP
        const phone = `${customer.phone_country_code}${customer.phone_number}`;
        //Need OTP API for integration
        const smsReqBody = {
          type: 'SMS',
          code: STEPUP_PHONE_OTP_VERIFICATION_TEMPLATE_CODE(),
          metadata: {
            OTP: SESSION_DATA.PHONE_OTP,
          },
          phoneNumber: phone,
        };

        const result = await this._http.post(
          `${NOTIFICATION_MS_URL()}/notification/directTransaction`,
          smsReqBody,
        );

        if (result && result.statusCode && result.statusCode !== 201) {
          Logger.error('Notification service response', result);
          throw new InternalServerErrorException(ER_SMS_API_GLOBAL);
        }
        return {
          session: sessionEntity.id,
          verification_method: VerficationMethodEnum.PHONE,
        };
      }

      if (this.rules.VERIFICATION_METHODS.VERIDIUM) {
        Logger.log('create veridium session');

        return {
          session: sessionEntity.id,
          verification_method: VerficationMethodEnum.VERIDIUM,
          veridium_session: SESSION_DATA.VERIDIUM_SESSION_ID,
        };
      }
    } catch (err) {
      if (
        err instanceof BadRequestException ||
        err instanceof ForbiddenException ||
        err instanceof UnauthorizedException
      )
        throw err;

      Logger.error('error while creating stepup session, error:', err.stack);

      throw new InternalServerErrorException(ER_STEPUP_GLOBAL);
    }
  }
}
