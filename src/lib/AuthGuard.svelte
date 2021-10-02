<script>
  import {app, auth} from '../firebase';
	import {getCurrentAuthState} from '../api';
	import { getAuth, signInWithPopup, signInWithRedirect, signOut, GithubAuthProvider } from "firebase/auth";
  // Firebase user
  let user = null;

  // expose property on the component that we can use
  // to choose if we want use popup or redirect
  export let useRedirect = false;

  // small mapper function
  const userMapper = claims => ({
    id: claims.user_id,
    name: claims.name,
    email: claims.email,
    picture: claims.picture
  });

  export const loginWithGithub = () => {
    const provider = new GithubAuthProvider();

    if (useRedirect) {
      return signInWithRedirect(auth, provider);
    } else {
      return signInWithPopup(auth, provider);
    }
  };

  export const logout = () => signOut(auth);

  // will be fired every time auth state changes
  auth.onAuthStateChanged(async fireUser => {
    if (fireUser) {
      // in here you might want to do some further actions
      // such as loading more data, etc.

      // if you want to set custom claims such as roles on a user
      // this is how to get them because they will be present
      // on the token.claims object
      const token = await fireUser.getIdTokenResult();
      user = userMapper(token.claims);
    } else {
      user = null;
    }
  });

  // reactive helper variable
  $: loggedIn = false;
	getCurrentAuthState().then((res) => {
		loggedIn = res;
	})
</script>

<!-- we will expose all required methods and properties on our slot -->
<div>
  <slot {user} {loggedIn} {loginWithGithub} {logout} />
</div>