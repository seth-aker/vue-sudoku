import 'package:app/utils/result.dart';
import 'package:flutter/cupertino.dart';

typedef CommandActionNoArgs<T> = Future<Result<T>> Function();
typedef CommandActionWithArgs<T, A> = Future<Result<T>> Function(A);

abstract class Command<T> extends ChangeNotifier {
  Command();
  bool _running = false;
  Result<T>? _result;

  bool get error => _result is Error;

  bool get running => _running;

  bool get completed => _result is Ok;

  Result? get result => _result;

  void clearResult() {
    _result = null;
    notifyListeners();
  }

  Future<void> _execute(CommandActionNoArgs<T> action) async {
    if (_running) return;
    _running = true;
    _result = null;
    notifyListeners();

    try {
      _result = await action();
    } finally {
      _running = false;
      notifyListeners();
    }
  }
}

class CommandWithArgs<T, A> extends Command<T> {
  CommandWithArgs(this._action);
  final CommandActionWithArgs<T, A> _action;
  Future<void> execute(A arg) async {
    await _execute(() => _action(arg));
  }
}

class CommandNoArgs<T> extends Command<T> {
  CommandNoArgs(this._action);
  final CommandActionNoArgs<T> _action;
  Future<void> execute() async {
    await _execute(_action);
  }
}
