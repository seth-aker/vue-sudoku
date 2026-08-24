import 'package:app/ui/core/widgets/button.dart';
import 'package:app/ui/user/state/user_bloc.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class RegisterForm extends StatefulWidget {
  @override
  State<StatefulWidget> createState() => _RegisterFormState();
}

class _RegisterFormState extends State<RegisterForm> {
  final _username = TextEditingController();
  final _password = TextEditingController();
  final _confirmPassword = TextEditingController();
  final _displayName = TextEditingController();

  @override
  void dispose() {
    _username.dispose();
    _password.dispose();
    _confirmPassword.dispose();
    _displayName.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Form(
        child: Column(
          children: [
            CupertinoFormSection(
              children: [
                CupertinoTextFormFieldRow(
                  prefix: const Text('Username'),
                  controller: _username,
                ),
                CupertinoTextFormFieldRow(
                  prefix: const Text('Password'),
                  obscureText: true,
                  controller: _password,
                ),
                CupertinoTextFormFieldRow(
                  prefix: const Text('Confirm Password'),
                  obscureText: true,
                  controller: _confirmPassword,
                ),
                CupertinoTextFormFieldRow(
                  prefix: const Text('Display name'),
                  controller: _displayName,
                ),
              ],
            ),
            Button.primary(
              child: const Text('Register'),
              onPressed: () {
                context.read<UserBloc>().add(
                  RegisterRequested(
                    username: _username.text,
                    password: _password.text,
                    displayName: _displayName.text,
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
