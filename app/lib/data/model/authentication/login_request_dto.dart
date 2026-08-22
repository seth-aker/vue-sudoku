import 'package:app/data/model/authentication/grant_type.dart';
import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

part 'login_request_dto.g.dart';

@JsonSerializable(
  createJsonSchema: true, 
  createFactory: false,

)
class LoginRequestDto extends Equatable {
  final String username;
  final String password;
  final GrantType grantType; 

  const LoginRequestDto({
    required this.username,
    required this.password,
    required this.grantType
  });

  Map<String, dynamic> toJson() =>
    _$LoginRequestDtoToJson(this);

  static const jsonSchema = _$LoginRequestDtoJsonSchema;

  @override
  List<Object?> get props => [username, password, grantType];
}