;(function(exports) {
    "use strict";

    Parse.TodoRouter = Parse.Router.extend({

        initialize: function() {//create own initialize function to overwrite default
            console.log("initialized");
            this.collection = new Parse.TodoActualList()
            this.isLoggedIn()
            this.container = document.querySelector('.container');
            this.homeView = d(Parse.HomeView, {collection: this.collection});
            this.authView = d(Parse.AuthView);
            Parse.history.start()

        },
        routes: {

            "login": "login",
            "*default": "home"
        },
        home: function() {
            if (!this.isLoggedIn()) return; //return is just exiting the function if they are not logged in

            var query = new Parse.Query(Parse.TaskModel);
            query.equalTo("user", this.user);
            // query.startsWith("description: h");
            this.collection.query = query;
            this.collection.fetch(); // fetch gets the data
            React.render(this.homeView, this.container);//automatically renders onto DOM; this.homeView/container is from Router;
        },
        isLoggedIn: function() {
            this.user = Parse.User.current();
            if (!this.user) {
                this.navigate("login", {trigger: true}); //this is a simple check
                return false;
            }
            return true;
        },
        login: function(){
            React.render(d(Parse.AuthView, {}), this.container);//d is from Parse; Parse.Authview is component?; this.container is from Router
        }
    })

    Parse.TaskModel = Parse.Object.extend({
        className: "TaskModel",
        defaults: {
            isDone: false,
            urgent: false,
            dueDate: null,
            tags: [],
            description: "no description given"
        },
         //listening for change on it's own attributes/events
         //save is backbone; sends the info back online to parse.com, to specific id is given to object, automatically saves
        initialize: function() {
            this.on("change", function(){
                this.save();
            })
        }
    })

    Parse.TodoActualList = Parse.Collection.extend({
        model: Parse.TaskModel,
        comparator: function(a, b){
            // if a is 'urgent', -1 (a comes before b)
            if(a.get('urgent') && !b.get('urgent') || !a.get('isDone') && b.get('isDone')) return -1;
            // if a 'isDone', 1 (a comes after b)
            if(a.get('isDone') && !b.get('isDone') || !a.get('urgent') && b.get('urgent')) return 1;

            return a.get('description') > b.get('description') ? 1 : -1;
        }
    })

    Parse.AuthView = React.createClass({//creating a React component, a.k.a element
        getInitialState: function(){//React works with 'states'; this sets the state before any interaction occurs
            return{};
        },

        getDefaultProps: function(){//gets default attributes; provides dynamic data
            return{};
        },

        componentWillMount: function() {},//invoked once, both client server before rendering
        componentWillReceiveProps: function() {},//invoked when attributes updated
        componentWillUnmount: function() {},

        _login: function(e){//use _ to create custom method in React
            e.preventDefault();
            var data =  {
                username: this.refs.email.getDOMNode().value,//ref is property refers to corresponding backing instance of anything from render()
                password: this.refs.pass.getDOMNode().value
            }
            var result = Parse.User.logIn(data.username, data.password);
            result.then(function(){
                window.location.hash = "#home";
            })
            result.fail(function(error){
                alert(error.message);
            })
        },

        _register: function(e){
            e.preventDefault();
            var data =  {
                username: this.refs.email.getDOMNode().value,
                password1: this.refs.pass1.getDOMNode().value,
                password2: this.refs.pass2.getDOMNode().value
         }
         if(data.password1 !== data.password2){
                alert("Passwords must match");
                return;
         }

            var user = new Parse.User();
            user.set('username', data.username);
            user.set('email', data.username);
            user.set('password', data.password1);

            var result = user.signUp();
            result.then(function(user){
                window.location.hash = "#home";
                alert("Welcome home");
            })
            result.fail(function(error){
                alert(error.message);
            })
        },

        render: function() {
            return d('div', [
                d('div.header1', '¡Nos hiciste falta!'),
                d('h5','Iniciar sesión:'),
                d('form.login', { onSubmit: this._login}, [
                    d('div', [
                        d('input:email@email[placeholder="Correo electrónico"][required]')
                    ]),
                    d('div.pass', [
                        d('input:password@pass[placeholder="Contraseña"][required]')
                    ]),
                    d('button:submit', '√')
                ]),

                d('h6', "¿Es la primer vez que utilizas Tú Lo Haces?"),
                d('h4', "Para crear una cuenta:"),

                d('form.register', { onSubmit: this._register }, [
                    d('div', [
                        d('input:email@email[name="email"][placeholder="Correo electrónico"][required]')
                    ]),
                    d('div.2', [
                        d('input:password@pass1[name="password1"][placeholder="Contraseña"][required]')
                    ]),
                    d('div.3', [
                        d('input:password@pass2[name="password2"][placeholder="Confirme su contraseña"][required]')
                    ]),
                    d('button:submit', '√')
                ])
            ]);
        }
    })

    Parse.HomeView = React.createClass({
        getInitialState: function() {
            return {}
        },
        getDefaultProps: function() {
            return {
                collection: null
            };
        },
        componentWillMount: function() {
            var self = this
            this.props.collection && this.props.collection.on("change reset add remove", function(){
                self.forceUpdate()
            })
        },
        // componentWillReceiveProps: function() {},
        componentWillUnmount: function() {
            this.props.collection && this.props.collection.off("change reset add remove")
        },
        _addTask: function(e){
            e.preventDefault();
            var data = {
                description: this.refs.description.getDOMNode().value,
                user: Parse.User.current()
            }
            var task = new Parse.Task(data);
            var acl = new Parse.ACL(Parse.User.current());
            var self = this;
            task.setACL(acl);
            task.save().then(function(){
                self.props.collection.fetch()
            });
        },
        _toggleUrgent: function(id){
            var m = this.props.collection.get(id)
            if(m){
                m.set('urgent', !m.get('urgent'));
                this.props.collection.sort();
            }
        },
        _toggleIsDone: function(id){
            var m = this.props.collection.get(id)
            if(m){
                m.set('isDone', !m.get('isDone'));
                if(m.get('isDone')){ // if setting to 'done', set 'urgent' to false
                    m.set('urgent', false);
                }
                this.props.collection.sort();
            }
        },
        _setDescription: function(id, e){
            var m = this.props.collection.get(id)
            if(m){
                m.set('description', e.target.innerText);
                m.save();
            }
        },
        // called by React whenever the state changes
        render: function() {
            var self = this;
            return
                d('div', [
                d('h5', 'To Do, Doing, Done'),
                d('form.tasks', { onSubmit: this._addTask }, [
                    d('div', [
                        d('input:text[required]@description')
                    ]),
                    d('button', '+')
                ]),
                d('ul',
                    this.props.collection.models.map(function(i){
                        var done = i.get('isDone'),
                            urgent = i.get('urgent'),
                            classString = [
                                urgent ? '.urgent' : '',
                                done ? '.isDone' : ''
                            ].join('')

                        return d('li'+classString, {key:i.id}, [
                            d('input:checkbox'+(done ? '[checked]' : ''), { onChange: self._toggleIsDone.bind(self, i.id) }),
                            d('span.description[contentEditable]', { onKeyUp: self._setDescription.bind(self, i.id) }, i.get('description')),
                            d('div.grid.grid-2-400', [
                                d('span.1', [
                                    d('input:checkbox'+(urgent ? '[checked]' : '')+'#task'+i.id, { onChange: self._toggleUrgent.bind(self, i.id) }),
                                    d('label[for=task'+i.id+']', 'Urgent?')
                                ]),
                                d('span.2', [
                                    d('input:date')
                                ])
                            ])
                        ])
                    })
                )
            ]);
        }
    })

})(typeof module === "object" ? module.exports : window)



