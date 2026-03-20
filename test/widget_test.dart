import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import 'package:detetive_na_propriedade/main.dart';
import 'package:detetive_na_propriedade/state/game_state.dart';

void main() {
  testWidgets('App renders home screen', (WidgetTester tester) async {
    await tester.pumpWidget(
      ChangeNotifierProvider(
        create: (_) => GameState(),
        child: const DetetiveNaPropriedadeApp(),
      ),
    );

    expect(find.text('Detetive na Propriedade'), findsOneWidget);
  });
}
