import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useContext } from 'react';
import { GoogleLogin } from 'react-google-login';
import { AppContext } from '../../AppContext';

const clientId = '578619713815-5crb1lnc5o6ff6ju8imndrqjo803ibk2.apps.googleusercontent.com';

export default function GoogleLoginComponent() {
  const { setAppState, setAppData } = useContext(AppContext);

  const handleLoginSuccess = (response) => {
    console.log('Login Success: currentUser:', response.profileObj);
    setAppData((prev) => ({ ...prev, googleData: response.profileObj }));
    localStorage.setItem('googleData', JSON.stringify(response.profileObj));
  };

  const handleLoginFailure = (response) => {
    console.error('Login Failed:', response);
    if (response.error === 'popup_closed_by_user') {
      // Handle popup closed by user (e.g., show an error message)
      console.error('Popup closed by user');
    } else {
      // Handle other login failures
    }
  };

  return (
    <GoogleLogin
      clientId={clientId}
      buttonText="Google"
      cookiePolicy='single_host_origin'
      onSuccess={handleLoginSuccess}
      onFailure={handleLoginFailure}
      isSignedIn={true}
      render={renderProps => (
        <button className='btn from-left' onClick={renderProps.onClick} disabled={renderProps.disabled}>
          <FontAwesomeIcon className='rotate' icon={faGoogle} /> Google
        </button>
      )}
    />
  );
}
