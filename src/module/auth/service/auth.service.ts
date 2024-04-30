import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ER_AUTH_INVALID_TOKEN,
  ER_AUTH_LOGINOUT_GLOBAL,
  ER_AUTH_LOGIN_GLOBAL,
  ER_AUTH_LOGIN_INVALID_CREDS,
  ER_AUTH_SESSIONCHECK_GLOBAL,
  ER_ONE_SESSION,
  ER_REFRESH_TOKEN_GLOBAL,
} from '../auth.error';
import { LoginDTO, TokenDTO } from '../model/dto/auth.dto';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { RefreshTokenEntity } from '../entity/refresh-token.entity';
import { AxiosHttpService } from '@module/http/http.service';
import { AuthMapper } from '../model/mapper/auth.mapper';
import {
  USER_LOGIN_REPOSITORY,
  REFRESH_TOKEN_REPOSITORY,
} from '@constant/provider';
import {
  AdminUserStatusEnum,
  ChannelEnum,
  CustomerRoleEnum,
  CustomerStatusEnum,
  StatusEnum,
  UserTypeEnum,
  VerificationStatusEnum,
} from '../model/enum';
import {
  JWT_REFRESH_TOKEN_EXPIRES_TIME,
  JWT_TOKEN_EXPIRES_TIME,
} from '@constant/jwt';
import { UserLoginEntity } from '../entity/user-login.entity';
import {
  LOGIN_PROFILE_API_ADMIN_URL,
  LOGIN_PROFILE_API_URL,
  LOGIN_PROFILE_STATUS_API_ADMIN_URL,
  LOGIN_PROFILE_STATUS_API_URL,
  UPDATE_CUSTOMER_LAST_LOGIN_API_ADMIN_URL,
  UPDATE_CUSTOMER_LAST_LOGIN_API_URL,
} from '@constant/url';
import { CommonHeadersDTO } from 'src/common/dto/headers.dto';
import { DeviceContract } from '@common/contract/device/device.contract';

@Injectable()
export class AuthService {
  sessionTimeSec: number;
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly _refreshTokenRepository: Repository<RefreshTokenEntity>,
    @Inject(USER_LOGIN_REPOSITORY)
    private readonly _userLoginRepository: Repository<UserLoginEntity>,
    private readonly jwtService: JwtService,
    private readonly _http: AxiosHttpService,
    private readonly _deviceContract: DeviceContract,
  ) {
    this.sessionTimeSec = 0;
  }

  getRefreshTokenLifeInSec() {
    if (this.sessionTimeSec === 0) {
      if (JWT_REFRESH_TOKEN_EXPIRES_TIME()) {
        if (JWT_REFRESH_TOKEN_EXPIRES_TIME().indexOf('m') !== -1) {
          this.sessionTimeSec = parseInt(JWT_REFRESH_TOKEN_EXPIRES_TIME()) * 60;
        } else if (JWT_REFRESH_TOKEN_EXPIRES_TIME().indexOf('h') !== -1) {
          this.sessionTimeSec =
            parseInt(JWT_REFRESH_TOKEN_EXPIRES_TIME()) * 60 * 60;
        } else {
          this.sessionTimeSec = parseInt(JWT_REFRESH_TOKEN_EXPIRES_TIME());
        }
      }
    }

    return this.sessionTimeSec;
  }

  async oneSessionActiveCheck(customerId: string) {
    try {
      let activeSessionCheck = true;

      const userLoginData = await this._userLoginRepository
        .createQueryBuilder('user_login')
        .innerJoin('user_login.refresh_token', 'refresh_token')
        .select('refresh_token.id, refresh_token.updated_at')
        .where(
          `user_login.user_id= :userId AND refresh_token.status= :status`,
          {
            userId: customerId,
            status: StatusEnum.Active,
          },
        )
        .getRawMany();

      if (!userLoginData.length) {
        return activeSessionCheck;
      }

      userLoginData.forEach(async (activeSession) => {
        //check and clear inactive sessions
        //check if still active
        const diff = Math.abs(
          new Date().getTime() - new Date(activeSession.updated_at).getTime(),
        );
        const diffSec = Math.ceil(diff / 1000);
        if (diffSec > this.getRefreshTokenLifeInSec()) {
          //delete if inactive
          await this._refreshTokenRepository.delete(activeSession.id);
        } else {
          activeSessionCheck = false;
        }
      });

      return activeSessionCheck;
    } catch (err) {
      Logger.error('Unable to make session check for user, error', err);
      if (
        err instanceof BadRequestException ||
        err instanceof ForbiddenException ||
        err instanceof UnauthorizedException
      )
        throw err;
      throw new InternalServerErrorException(ER_AUTH_SESSIONCHECK_GLOBAL);
    }
  }

  /** Logout */
  async logout(user_id: string) {
    try {
      const userLoginData = await this._userLoginRepository.findOne({
        where: { user_id: user_id },
      });
      if (!userLoginData) return { message: 'No session found' };

      //update database
      await this._userLoginRepository.update(
        { user_id: userLoginData['user_id'] },
        { refresh_token: null },
      );

      //delete old refresh token
      await this._refreshTokenRepository.delete({
        session_id: userLoginData.session_id,
      });

      return { message: 'success' };
    } catch (err) {
      Logger.error('Unable to logout user, error', err);
      if (
        err instanceof BadRequestException ||
        err instanceof ForbiddenException ||
        err instanceof UnauthorizedException
      )
        throw err;
      throw new InternalServerErrorException(ER_AUTH_LOGINOUT_GLOBAL);
    }
  }

  /**Create Access Token*/
  async createToken(tokenData, subject, audience) {
    try {
      return this.jwtService.sign(tokenData, {
        expiresIn: JWT_TOKEN_EXPIRES_TIME(),
        header: {
          typ: 'JWT',
          alg: 'RS256',
        },
        algorithm: 'RS256',
        audience: audience,
        mutatePayload: false,
        subject: subject,
      });
    } catch (err) {
      Logger.error('Unable to generate token, error:', err);
      throw err;
    }
  }

  /**Create Refresh Token*/
  async createRefreshToken(tokenData, subject, audience) {
    try {
      const entity = new RefreshTokenEntity();

      entity.session_id = tokenData.session_id;

      await this._refreshTokenRepository.save(entity);

      tokenData.refresh_token_id = entity.id;

      const refresh_token = this.jwtService.sign(tokenData, {
        expiresIn: JWT_REFRESH_TOKEN_EXPIRES_TIME(),
        header: {
          typ: 'JWT',
          alg: 'RS256',
        },
        algorithm: 'RS256',
        audience: audience,
        mutatePayload: false,
        subject: subject,
      });

      return { refresh_token, refresh_token_id: entity.id };
    } catch (err) {
      Logger.error('Unable to generate refresh token, error:', err);
      throw err;
    }
  }

  /** CUSTOMER */

  /**Validate Customer*/
  async validateCustomer(username: string, password: string): Promise<any> {
    try {
      const result = await this._http.post(LOGIN_PROFILE_API_URL(), {
        username,
        password,
      });

      if (result.statusCode === 201) {
        const user = result.data;
        if (user && user['status'] === CustomerStatusEnum.Active) {
          return AuthMapper.toCustomerTokenModel(user);
        }
      } else {
        if (result.statusCode !== 400)
          Logger.error(
            'Unable to give user login access. error: ',
            result,
            result.statusCode,
          );
      }

      return null;
    } catch (err) {
      Logger.error('Error while finding user by email. error: ', err);
      throw new UnauthorizedException(ER_AUTH_LOGIN_GLOBAL);
    }
  }

  /** Authenticate Customer */
  async login(
    loginDTO: LoginDTO,
    headers: CommonHeadersDTO,
    location: string,
  ): Promise<TokenDTO> {
    try {
      const userData = await this.validateCustomer(
        loginDTO.username,
        loginDTO.password,
      );
      if (!userData) {
        throw new UnauthorizedException(ER_AUTH_LOGIN_INVALID_CREDS);
      }
      const { customer_id: customerId } = userData;

      if (
        userData.role === CustomerRoleEnum.Customer &&
        headers.CHANNEL === ChannelEnum.MOB
      ) {
        //check for registered device
        const deviceData = await this._deviceContract.CheckActiveDevice(
          customerId,
          headers.DEVICE_ID,
        );
        userData.device = deviceData;
      }
      //check for already active session, if session is already active reject the request

      if (!loginDTO.force && !(await this.oneSessionActiveCheck(customerId))) {
        throw new ForbiddenException(ER_ONE_SESSION);
      }

      const tokenDataObject = JSON.parse(JSON.stringify(userData));
      const tokenData = { ...tokenDataObject, session_id: uuidv4() };
      //create token
      const token = await this.createToken(
        tokenData,
        tokenData.customer_id,
        'customer',
      );

      //create refresh token
      const {
        refresh_token: refreshToken,
        refresh_token_id,
      } = await this.createRefreshToken(
        tokenData,
        'customer-refresh-token',
        'customer',
      );

      //need to add device specific feature
      const whereCondetion = {
        user_id: customerId,
        channel: ChannelEnum[headers.CHANNEL],
      };
      if (
        userData.role === CustomerRoleEnum.Customer &&
        headers.CHANNEL === ChannelEnum.MOB
      ) {
        whereCondetion['device_id'] = headers.DEVICE_ID;
      }
      const loginData = await this._userLoginRepository.findOne({
        where: whereCondetion,
      });

      if (!loginData) {
        const refreshTokenEntity = new RefreshTokenEntity();
        refreshTokenEntity.id = refresh_token_id;

        const entity = new UserLoginEntity();
        entity.user_id = customerId;
        entity.refresh_token = refreshTokenEntity;
        entity.user_type = UserTypeEnum.Customer;
        entity.session_id = tokenData.session_id;
        entity.location = location;
        entity.channel = ChannelEnum[headers.CHANNEL];
        if (
          userData.role === CustomerRoleEnum.Customer &&
          headers.CHANNEL === ChannelEnum.MOB
        )
          entity.device_id = headers.DEVICE_ID;

        await this._userLoginRepository.save(entity);
      } else {
        const stepup_auth_status =
          loginData.stepup_auth_status === VerificationStatusEnum.Failed
            ? VerificationStatusEnum.Failed
            : VerificationStatusEnum.Pending;
        await this._userLoginRepository.query(
          `UPDATE "USER_LOGIN" SET 
          "last_login" = CURRENT_TIMESTAMP,
           "refreshTokenId" = :0,
           "session_id" = :1,
           "location" = :2,
           "stepup_auth_status" = :3,
           "last_login_location" = :4,
            "updated_at" = CURRENT_TIMESTAMP
             WHERE "id" IN (:5)`,
          [
            refresh_token_id,
            tokenData.session_id,
            location,
            stepup_auth_status,
            loginData.location,
            loginData.id,
          ],
        );
      }

      //update last login time in admin service async
      await this._http.put(
        `${UPDATE_CUSTOMER_LAST_LOGIN_API_URL()}/${customerId}?location=${location}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            REQUESTUUID: headers.GLOBALUUID,
            GLOBALUUID: headers.REQUESTUUID,
            CHANNEL: headers.CHANNEL,
            DEVICE_ID: headers.DEVICE_ID,
          },
        },
      );
      return {
        token_type: 'bearer',
        expires_in: JWT_TOKEN_EXPIRES_TIME(),
        refresh_expires_in: JWT_REFRESH_TOKEN_EXPIRES_TIME(),
        access_token: token,
        refresh_token: refreshToken,
        scope: 'customer',
        user_data: userData,
      };
    } catch (err) {
      Logger.error('Unable to access login, error', err);
      if (
        err instanceof BadRequestException ||
        err instanceof ForbiddenException ||
        err instanceof UnauthorizedException
      )
        throw err;
      throw new InternalServerErrorException(ER_AUTH_LOGIN_GLOBAL);
    }
  }

  /** Refresh token Customer*/
  async refreshToken(refreshToken: string): Promise<TokenDTO> {
    try {
      const token = refreshToken.replace('Bearer ', '');
      //check if refresh token is valid
      await this.jwtService.verifyAsync(token, {
        subject: 'customer-refresh-token',
        audience: 'customer',
        algorithms: ['RS256'],
      });
      //get token data
      const tokenData = await this.jwtService.decode(token, {
        json: true,
      });

      //check if it is still alive
      const userLoginData = await this._userLoginRepository.findOne({
        where: { refresh_token: tokenData['refresh_token_id'] },
      });
      if (!userLoginData) {
        throw new UnauthorizedException(ER_AUTH_INVALID_TOKEN);
      }

      //check if token in blocked
      const check = await this._refreshTokenRepository.count({
        where: { id: tokenData['refresh_token_id'], status: StatusEnum.Active },
      });
      if (check === 0) {
        throw new UnauthorizedException(ER_AUTH_INVALID_TOKEN);
      }

      //check if user is blocked
      const result = await this._http.get(
        `${LOGIN_PROFILE_STATUS_API_URL()}/${tokenData['customer_id']}`,
      );
      if (
        !(
          result.statusCode === 200 &&
          result.data &&
          result.data['status'] === CustomerStatusEnum.Active
        )
      ) {
        throw new UnauthorizedException(ER_AUTH_INVALID_TOKEN);
      }

      //create token
      delete tokenData['iat'];
      delete tokenData['exp'];
      delete tokenData['aud'];
      delete tokenData['sub'];
      delete tokenData['iss'];
      const oldRefreshTokenId = tokenData['refresh_token_id'];
      const newToken = await this.createToken(
        tokenData,
        tokenData['customer_id'],
        'customer',
      );

      //create refresh token
      const {
        refresh_token: newRefreshToken,
        refresh_token_id,
      } = await this.createRefreshToken(
        tokenData,
        'customer-refresh-token',
        'customer',
      );

      //update database
      const refreshTokenEntity = new RefreshTokenEntity();
      refreshTokenEntity.id = refresh_token_id;

      await this._userLoginRepository.update(
        { user_id: tokenData['customer_id'] },
        { refresh_token: refreshTokenEntity },
      );

      //delete old refresh token
      await this._refreshTokenRepository.delete(oldRefreshTokenId);

      return {
        token_type: 'bearer',
        expires_in: JWT_TOKEN_EXPIRES_TIME(),
        refresh_expires_in: JWT_REFRESH_TOKEN_EXPIRES_TIME(),
        access_token: newToken,
        refresh_token: newRefreshToken,
        scope: 'customer',
      };
    } catch (err) {
      if (
        err instanceof BadRequestException ||
        err instanceof ForbiddenException ||
        err instanceof UnauthorizedException
      )
        throw err;
      Logger.error('Unable to generate refresh token, error:', err);
      if (err.name === 'JsonWebTokenError') {
        throw new UnauthorizedException(ER_AUTH_INVALID_TOKEN);
      }
      throw new InternalServerErrorException(ER_REFRESH_TOKEN_GLOBAL);
    }
  }

  /** ADMIN */

  /** Validate Admin User*/
  async validateAdminUser(username: string, password: string): Promise<any> {
    try {
      const result = await this._http.post(LOGIN_PROFILE_API_ADMIN_URL(), {
        username,
        password,
      });

      if (result.statusCode === 201) {
        const user = result.data;
        if (user && user['status'] === AdminUserStatusEnum.Active) {
          return AuthMapper.toAdminUserTokenModel(user);
        }
      } else {
        if (result.statusCode !== 400)
          Logger.error(
            'Unable to give user login access. error: ',
            result,
            result.statusCode,
          );
      }

      return null;
    } catch (err) {
      Logger.error('Error while finding user by email. error: ', err);
      throw new UnauthorizedException(ER_AUTH_LOGIN_GLOBAL);
    }
  }

  /** Admin Login */
  async adminUserLogin(
    loginDTO: LoginDTO,
    headers: CommonHeadersDTO,
    location: string,
  ): Promise<TokenDTO> {
    try {
      const userData = await this.validateAdminUser(
        loginDTO.username,
        loginDTO.password,
      );
      if (!userData) {
        throw new UnauthorizedException(ER_AUTH_LOGIN_INVALID_CREDS);
      }
      const { user_id: userId } = userData;

      //check for already active session, if session is already active reject the request

      // if (!await this.oneSessionActiveCheck(userId)) {
      // throw new ForbiddenException(ER_ONE_SESSION);
      // }

      const tokenDataObject = JSON.parse(JSON.stringify(userData));
      const tokenData = { ...tokenDataObject, session_id: uuidv4() };

      //create token
      const token = await this.createToken(
        tokenData,
        tokenData.user_id,
        'admin',
      );
      //create refresh token
      const {
        refresh_token: refreshToken,
        refresh_token_id,
      } = await this.createRefreshToken(
        tokenData,
        'admin-refresh-token',
        'admin',
      );

      const check = await this._userLoginRepository.count({
        where: { user_id: userId },
      });
      if (check === 0) {
        const refreshTokenEntity = new RefreshTokenEntity();
        refreshTokenEntity.id = refresh_token_id;

        const entity = new UserLoginEntity();
        entity.user_id = userId;
        entity.session_id = tokenData.session_id;
        entity.channel = ChannelEnum[headers.CHANNEL];
        entity.location = location;
        entity.refresh_token = refreshTokenEntity;
        entity.user_type = UserTypeEnum.Admin;
        await this._userLoginRepository.save(entity);
      } else {
        await this._userLoginRepository.query(
          `UPDATE "USER_LOGIN" SET 
          "last_login" = CURRENT_TIMESTAMP,
           "refreshTokenId" = :0,
            "updated_at" = CURRENT_TIMESTAMP
             WHERE "user_id" IN (:1)`,
          [refresh_token_id, userId],
        );
      }

      //update last login time in admin service async
      await this._http.put(
        `${UPDATE_CUSTOMER_LAST_LOGIN_API_ADMIN_URL()}/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return {
        token_type: 'bearer',
        expires_in: JWT_TOKEN_EXPIRES_TIME(),
        refresh_expires_in: JWT_REFRESH_TOKEN_EXPIRES_TIME(),
        access_token: token,
        refresh_token: refreshToken,
        scope: 'admin',
        user_data: userData,
      };
    } catch (err) {
      Logger.error('Unable to access login, error', err);
      if (
        err instanceof BadRequestException ||
        err instanceof ForbiddenException ||
        err instanceof UnauthorizedException
      )
        throw err;
      throw new InternalServerErrorException(ER_AUTH_LOGIN_GLOBAL);
    }
  }

  /** Refresh token Admin */
  async adminUserRefreshToken(refreshToken: string): Promise<TokenDTO> {
    try {
      const token = refreshToken.replace('Bearer ', '');
      //check if refresh token is valid
      await this.jwtService.verifyAsync(token, {
        subject: 'admin-refresh-token',
        audience: 'admin',
        algorithms: ['RS256'],
      });

      //get token data
      const tokenData = await this.jwtService.decode(token, {
        json: true,
      });

      //check if it is still alive
      const userLoginData = await this._userLoginRepository.findOne({
        where: { refresh_token: tokenData['refresh_token_id'] },
      });
      if (!userLoginData) {
        throw new UnauthorizedException(ER_AUTH_INVALID_TOKEN);
      }

      //check if token in blocked
      const check = await this._refreshTokenRepository.count({
        where: { id: tokenData['refresh_token_id'], status: StatusEnum.Active },
      });

      if (check === 0) {
        throw new UnauthorizedException(ER_AUTH_INVALID_TOKEN);
      }

      //check if user is blocked
      const result = await this._http.get(
        `${LOGIN_PROFILE_STATUS_API_ADMIN_URL()}/${tokenData['user_id']}`,
      );

      if (
        !(
          result.statusCode === 200 &&
          result.data &&
          result.data['status'] === AdminUserStatusEnum.Active
        )
      ) {
        throw new UnauthorizedException(ER_AUTH_INVALID_TOKEN);
      }

      //create token
      delete tokenData['iat'];
      delete tokenData['exp'];
      delete tokenData['aud'];
      delete tokenData['sub'];
      delete tokenData['iss'];
      const oldRefreshTokenId = tokenData['refresh_token_id'];
      const newToken = await this.createToken(
        tokenData,
        tokenData['user_id'],
        'admin',
      );

      //create refresh token
      const {
        refresh_token: newRefreshToken,
        refresh_token_id,
      } = await this.createRefreshToken(
        tokenData,
        'admin-refresh-token',
        'admin',
      );

      //update database
      const refreshTokenEntity = new RefreshTokenEntity();
      refreshTokenEntity.id = refresh_token_id;

      await this._userLoginRepository.update(
        { user_id: tokenData['user_id'] },
        { refresh_token: refreshTokenEntity },
      );

      //delete old refresh token
      await this._refreshTokenRepository.delete(oldRefreshTokenId);

      return {
        token_type: 'bearer',
        expires_in: JWT_TOKEN_EXPIRES_TIME(),
        refresh_expires_in: JWT_REFRESH_TOKEN_EXPIRES_TIME(),
        access_token: newToken,
        refresh_token: newRefreshToken,
        scope: 'admin',
      };
    } catch (err) {
      if (
        err instanceof BadRequestException ||
        err instanceof ForbiddenException ||
        err instanceof UnauthorizedException
      )
        throw err;
      Logger.error('Unable to generate refresh token, error:', err);
      if (err.name === 'JsonWebTokenError') {
        throw new UnauthorizedException(ER_AUTH_INVALID_TOKEN);
      }
      throw new InternalServerErrorException(ER_REFRESH_TOKEN_GLOBAL);
    }
  }
}
