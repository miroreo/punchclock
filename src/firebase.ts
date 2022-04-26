// import firebase app (required)
import { initializeApp } from 'firebase/app';
// firebase auth mixin (required for every firebase feature)
import { getAuth, GithubAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// firebase config with non-auth properties skipped
const firebaseConfig = {
	apiKey: 'AIzaSyD_CoWFbWb9jGWbuwvnzxF_RIUtlDdIsLU',
	authDomain: 'punch-clock-7b86b.firebaseapp.com',
	projectId: 'punch-clock-7b86b',
	storageBucket: 'punch-clock-7b86b.appspot.com',
	messagingSenderId: '736408468007',
	appId: '1:736408468007:web:fb388a9867cbfce932ac02'
};

// initialize firebase app. required as first step
export const app = initializeApp(firebaseConfig);

// get the firebase auth object
export const auth = getAuth(app);

export const firestore = getFirestore(app);
