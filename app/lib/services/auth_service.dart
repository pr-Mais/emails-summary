import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

class AuthService {
  final _instance = FirebaseAuth.instance;

  Stream<User?> get authStateChanges => _instance.authStateChanges();

  Future<UserCredential> signInWithGoogle() async {
    final google = GoogleAuthProvider();
    google.addScope("https://www.googleapis.com/auth/gmail.readonly");
    google.addScope("https://www.googleapis.com/auth/userinfo.email");
    google.addScope("https://www.googleapis.com/auth/userinfo.profile");

    final cred = await _instance.signInWithPopup(google);
    await storeUser(cred);

    return cred;
  }

  Future<void> storeUser(UserCredential cred) async {
    return FirebaseFirestore.instance
        .collection('user')
        .doc(_instance.currentUser!.uid)
        .set({
      'email': cred.user?.email,
      'name': cred.user?.displayName,
      'photoUrl': cred.user?.photoURL,
      'uid': cred.user?.uid,
      'accessToken': cred.credential?.accessToken,
      // Default to every day
      'frequency': 'EVERY_DAY',
    });
  }

  Future<void> updateUserConfig(Map<String, dynamic> data) async {
    return FirebaseFirestore.instance
        .collection('user')
        .doc(_instance.currentUser!.uid)
        .update(data);
  }

  Future<void> signOut() async {
    return _instance.signOut();
  }
}
