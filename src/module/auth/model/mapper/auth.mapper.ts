import { AdminUserTokenDTO, CustomerTokenDTO } from '../dto/auth.dto';
import { CustomerStatusEnum } from '../enum';

export class AuthMapper {
  static toCustomerTokenModel(entity): CustomerTokenDTO {
    const model = new CustomerTokenDTO();

    model.id = entity.id;
    model.customer_id = entity.customer_id;
    model.cifid = entity.cifid;
    model.first_name = entity.first_name;
    model.last_name = entity.last_name;
    model.preferred_language = entity.preferred_language;
    model.preferred_currency = entity.preferred_currency;
    model.email = entity.email;
    model.role = entity.role;
    model.age = entity.age;
    model.status = CustomerStatusEnum[entity.status];
    model.last_login = entity.last_login;
    return model;
  }

  static toAdminUserTokenModel(entity): AdminUserTokenDTO {
    const model = new AdminUserTokenDTO();

    model.id = entity.id;
    model.user_id = entity.user_id;
    model.first_name = entity.first_name;
    model.last_name = entity.last_name;
    model.email = entity.email;
    model.role = entity.role;
    model.status = CustomerStatusEnum[entity.status];
    model.last_login = entity.last_login;
    return model;
  }
}
