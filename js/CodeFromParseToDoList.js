    Parse.AuthView = Parse.TemplateView.extend({
            el: ".container1",
            view: "authview",
            events: {
                "submit .login": "login",
                "submit .register": "register"
            },
            login: function(event) {
                event.preventDefault();
                var data = {
                    username: this.el.querySelector(".login input[name='email']").value,
                    password: this.el.querySelector(".login input[name= 'password']").value
                }
                var result = Parse.User.logIn(data.username, data.password);
                result.then(function() {
                    window.location.hash = "#view"
                })
                result.fail(function(error) {
                    alert(error.message);
                })
            },
            register: function(event) {
                event.preventDefault();
                var data = {
                    username: this.el.querySelector(".register input[name= 'email']").value,
                    password1: this.el.querySelector(".regiser input[name= 'password1']").value,
                    password2: this.el.querySelector(".register input[name='password2']").value
                }
                if (data.password1 !== data.password2) {
                    alert("Passwords must match");
                    return;
                }
                var user = new Parse.User();
                user.set('username', data.username)
                user.set('email', data.username)
                user.set('password', data.password1)

                var result = user.signUp()
                result.then(function(user) {
                    window.location.hash = "#view"
                    alert("Welcome home, " + user.get("username"));
                })
                result.fail(function(error) {
                    alert(error.message);
                })
            }
    });