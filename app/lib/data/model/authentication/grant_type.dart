import 'package:json_annotation/json_annotation.dart';

@JsonEnum()
enum GrantType {
  @JsonValue('password')
  password, 
  @JsonValue('refresh_token')
  refreshToken;
}