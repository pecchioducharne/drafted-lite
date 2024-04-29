const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.setRecruiterClaims = functions.https.onCall((data, context) => {
  // Check if request is made by an authenticated user
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Only authenticated users can set custom claims');
  }

  const userId = data.userId;
  return admin.auth().setCustomUserClaims(userId, { recruiter: true })
    .then(() => {
      return { message: 'Custom claims set for recruiter' };
    })
    .catch(error => {
      throw new functions.https.HttpsError('internal', 'Unable to set custom claims: ' + error.message);
    });
});
