import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

part 'register_request_dto.g.dart';

@JsonSerializable(createJsonSchema: true, createFactory: false)
class RegisterRequestDto extends Equatable {
  final String username;
  final String password;
  final String? displayName;
  const RegisterRequestDto({
    required this.username,
    required this.password,
    this.displayName,
  });

  Map<String, dynamic> toJson() {
    return _$RegisterRequestDtoToJson(this);
  }

  static const jsonSchema = _$RegisterRequestDtoJsonSchema;

  @override
  List<Object?> get props => [username, password, displayName];
}
