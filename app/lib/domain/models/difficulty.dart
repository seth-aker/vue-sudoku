enum DifficultyRating {
  beginner,
  easy,
  medium,
  hard,
  impossible;

  @override
  String toString() {
    return name.substring(0, 1).toUpperCase() + name.substring(1);
  }
}
