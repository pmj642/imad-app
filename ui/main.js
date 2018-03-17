console.log('Loaded!');

submit = document.getElementById('submit_btn');

submit.onclick = function() {
    
    var request = new XMLHttpRequest();
    
    request.onreadystatechange = function() {
        
        if(request.readyState === XMLHttpRequest.DONE)
        {
            if(request.status === 200)
                alert('Logged in successfully!');
            else if(request.status === 403)
                alert('Username/password incorrect!');
            else if(request.status === 500)
                alert('Something wrong with server!');
        }
    };

var username = document.getElementById('username').value;
var password = document.getElementById('password').value;
console.log(username);
console.log(password);
request.open('POST','http://pmj642.imad.hasura-app.io/login',true);
request.setRequestHeader = 'application/json';
request.send(JSON.stringify({username: username,password: password}));

};