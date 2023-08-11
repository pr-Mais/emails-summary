import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/auth_provider.dart';

class HomePage extends ConsumerStatefulWidget {
  const HomePage({super.key});

  @override
  ConsumerState<HomePage> createState() => _HomePageState();
}

class _HomePageState extends ConsumerState<HomePage> {
  final controller = TextEditingController();

  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      controller.addListener(() {
        if (controller.text.isEmpty) {
          return;
        }

        ref
            .read(authService)
            .updateUserConfig({'phoneNumber': controller.text});
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).asData?.value;
    final config = ref.watch(userConfig).asData?.value;

    return Scaffold(
      body: Center(
        child: SizedBox(
          width: 400,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('User: ${user?.email}'),
              const SizedBox(height: 40),
              TextField(
                decoration: InputDecoration(
                  labelText: 'Phone number',
                  hintText: config?.phoneNumber,
                ),
                textDirection: TextDirection.ltr,
                textAlign: TextAlign.start,
                controller: controller,
              ),
              // Frequency dropdown
              DropdownButtonFormField<String>(
                decoration: const InputDecoration(
                  labelText: 'Frequency',
                ),
                value: config?.frequency,
                onChanged: (value) {
                  ref.read(authService).updateUserConfig({'frequency': value});
                },
                items: const [
                  DropdownMenuItem(
                    value: 'EVERY_DAY',
                    child: Text('Every day'),
                  ),
                  DropdownMenuItem(
                    value: 'EVERY_WEEK',
                    child: Text('Every week'),
                  ),
                  DropdownMenuItem(
                    value: 'EVERY_MONTH',
                    child: Text('Every month'),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () {
                  ref.read(authService).signOut();
                },
                child: const Text('Sign out'),
              )
            ],
          ),
        ),
      ),
    );
  }
}
