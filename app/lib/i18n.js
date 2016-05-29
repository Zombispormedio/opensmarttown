const i18n = {}


i18n.M = {
    welcome: 'Welcome to Smart Town Open Data',
    welcome_users: "Welcome to Open Data Smart Town Users. If you send POST request with your email, you will receive a token. It's easy",
    res_update_token: "Thank you for updating your access token. It have been sent to your email",
    res_create_token: "Thank you for creating your access token. It have been sent to your email",
    msg_update_token: "<html><body><p>Hello, Developer 😬<p><h2>Congratulations!</h2> <p>You have just received your recently updated Access Token to use in Smart Town Open Data APi 😎</p><p>Your Access Token: %s</p><p>Kisses, Developer 😚</p></body></html>",
    msg_create_token: "<html><body><p>Hello, Developer 😳<p><h2>Congratulations!</h2> <p>You have just received your recently created Access Token to use in Smart Town Open Data APi 😳</p><p>Your Access Token: %s</p><p>Kisses, Developer 😚</p></body></html>",
    msg_subject: "Smart Town Love Message",
    toname:"Someone Special", 
    fromname:"Smart Town Dev Team",
    

}

i18n.C={
    ANALOG:"ANALOG",
    DIGITAL:"DIGITAL"
}


i18n.E = {
    no_email: "Email, please",
    lack_of_body: "Lack of body, pig",
    email_not_exists:"Email is not valid, liar",
    api_key:"API Key, please, in https://smart-town.herokuapp.com",
    api_key_not_valid:"Not Valid Api Key",
      no_magnitude: "Magnitude doesn't exists",
    
}




module.exports = i18n;