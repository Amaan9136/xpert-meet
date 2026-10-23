import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { GoogleLogout } from 'react-google-login';

export default function GoogleLogoutComponent() {
  const clientId = '578619713815-5crb1lnc5o6ff6ju8imndrqjo803ibk2.apps.googleusercontent.com';
  
  const handleLogout = () => {
    localStorage.removeItem('googleData');
    window.location.reload();
  };

  return (
    <div>
      <GoogleLogout
        clientId={clientId}
        buttonText="Logout"
        onLogoutSuccess={handleLogout}
        onFailure={(error) => {
          console.error('Logout failed:', error);
        }}
        render={renderProps => (
          <button className='btn from-left' onClick={renderProps.onClick} disabled={renderProps.disabled}>
            <FontAwesomeIcon className='rotate' icon={faGoogle} /> Logout
          </button>
        )}
      />
    </div>
  );
}