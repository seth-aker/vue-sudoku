import 'package:app/ui/core/widgets/button.dart';
import 'package:app/ui/user/state/user_bloc.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

// TODO: validate login form!
class LoginForm extends StatefulWidget {
  const LoginForm({super.key});

  @override
  State<StatefulWidget> createState() => _LoginFormState();
}

class _LoginFormState extends State<LoginForm> {
  final _username = TextEditingController();

  final _password = TextEditingController();

  @override
  void dispose() {
    _username.dispose();
    _password.dispose();
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
              ],
            ),
            Button.primary(
              child: const Text('Login'),
              onPressed: () {
                context.read<UserBloc>().add(
                  LoginRequested(
                    username: _username.text,
                    password: _password.text,
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
