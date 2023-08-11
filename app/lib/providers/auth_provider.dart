import 'package:app/services/auth_service.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final authService = Provider.autoDispose((ref) => AuthService());

final authProvider = StreamProvider.autoDispose<User?>((ref) {
  return FirebaseAuth.instance.authStateChanges();
});

final userConfig = StreamProvider.autoDispose<UserConfig?>((ref) {
  final user = ref.watch(authProvider).asData?.value;

  if (user == null) {
    return Stream.value(null);
  }

  return FirebaseFirestore.instance
      .collection('user')
      .doc(user.uid)
      .snapshots()
      .map((doc) => UserConfig.fromMap(doc.data()!));
});

class UserConfig {
  final String? email;
  final String? phoneNumber;
  final String? name;
  final String? photoUrl;
  final String? uid;
  final String? accessToken;
  final String? frequency;

  UserConfig({
    this.email,
    this.phoneNumber,
    this.name,
    this.photoUrl,
    this.uid,
    this.accessToken,
    this.frequency,
  });

  factory UserConfig.fromMap(Map<String, dynamic> map) {
    return UserConfig(
      email: map['email'],
      phoneNumber: map['phoneNumber'],
      name: map['name'],
      photoUrl: map['photoUrl'],
      uid: map['uid'],
      accessToken: map['accessToken'],
      frequency: map['frequency'],
    );
  }
}
