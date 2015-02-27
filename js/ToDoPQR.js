//I SHOULD DO TESTS FIRST
//CAN I DELETE TEMPLATES? I think yes because html in react
;(function(exports) {
    "use strict";

    Parse.TodoRouter = Parse.Router.extend({

        initialize: function() {//create own initialize function to overwrite default
            console.log("initialized");
            this.collection = new Parse.TodoActualList();
            this.isLoggedIn();
            this.container = document.querySelector('.container');
            this.homeView = d(Parse.homeView, {collection: this.collection});
            Parse.history.start();
        },
        routes: {
            "login": "login",
            "*default": "home",

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
    })

//** NEED THIS VIEW? CHANGE IT TO REACT? IS THIS REPLACED WITH HOMEVIEW?
    // Parse.TodoView = Parse.TemplateView.extend({
    //     el: ".container",
    //     view: "PAppQ", //--points to parseToDoapp.html
    //     events: {
    //         "submit .tasks": "addTask",
    //         "change input[name= 'urgent']": "toggleUrgent", //if input is urgent, then toggleUrgent function
    //         "change input[name= 'isDone']": "toggleIsDone",
    //         "keyup .description": "setDescription"
    //     },
    //     addTask: function(event) {
    //         event.preventDefault();
    //         debugger;
    //         var data = {
    //             description: this.el.querySelector("input[name= 'John']").value,
    //             user: Parse.User.current()
    //         }
    //         this.collection.create(data, { //does an .add AND creates a new model and saves it
    //             validate: true
    //         })
    //         console.log("Yay!");
    //         // debugger;
    //     },
    //     getModelAssociatedWithEvent: function(event) { //should always return a model
    //         var el = event.target,
    //             li = $(el).closest('li').get(0),
    //             id = li.getAttribute('id'),
    //             m = this.collection.get(id);

    //         return m;

    //     },
    //     toggleUrgent: function(event) {
    //         var m = this.getModelAssociatedWithEvent(event);
    //         if (m) {
    //             m.set('urgent', !m.get('urgent'));

    //             this.colletion.sort();
    //             this.render();
    //         }
    //     },
    //     toggleIsDone: function(event) {
    //         var m = this.getModelAssociatedWithEvent(event);
    //         if (m) {
    //             m.set('isDone', !m.get('isDone'));
    //             if (m.get('isDone')) {
    //                 m.set('urgent', false);
    //             }
    //             this.collection.sort();
    //             this.render();
    //         }
    //     },
    //     setDescription: function(event) {
    //         var m = this.getModelAssociatedWithEvent(event);
    //         if (m) {
    //             m.set('description', event.target.innerText);
    //             m.save();
    //         }
    //     }
    // })

    Parse.AuthView = React.createClass({//creating a React component, a.k.a element
        getInitialState: function(){//React works with 'states'; this sets the state before any interaction occurs
            return{};
        },

        getDefaultProps: function(){//gets default attributes; provides dynamic data
            return{};
        },

        componentWillMount : function() {},//invoked once, both client server before rendering
        componentWillReceiveProps: function() {},//invoked when attributes updated
        componentWillUnmount : function() {},// invoked before unmounting component

            _login: function(e){//use _ to create custom method in React
            e.preventDefault();
            var data =  {
                username: this.refs.email.getDOMNode().value,//ref is property refers to corresponding backing instance of anything from render()
                password: this.refs.pass.getDOMNode().value
            }
            var result = Parse.User.logIn(data.username, data.password);
            result.then(function(){
                window.location.hash = "#home"
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
            user.set('username', data.username)
            user.set('email', data.username)
            user.set('password', data.password1)

            var result = user.signUp()
            result.then(function(user){
                window.location.hash = "#home"
                alert("Welcome home, "+user.get("username"));
            })
            result.fail(function(error){
                alert(error.message);
            })
        },

        render: function() {
            return d('div', [
                d('h5', 'Login:'),
                d('form.login', { onSubmit: this._login }, [
                    d('div', [
                        d('input:email@email[placeholder="email"][required]')
                    ]),
                    d('div.pass', [
                        d('input:password@pass[placeholder="password"][required]')
                    ]),
                    d('button:submit', '√')
                ]),

                d('h5', "If you don't have an account, register here:"),

                d('form.register', { onSubmit: this._register }, [
                    d('div', [
                        d('input:email@email[name="email"][placeholder="email"][required]')
                    ]),
                    d('div.2', [
                        d('input:password@pass1[name="password1"][placeholder="password"][required]')
                    ]),
                    d('div.3', [
                        d('input:password@pass2[name="password2"][placeholder="repeat password"][required]')
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
            return d('div', [
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
    Parse.TaskModel = Parse.Object.extend({
        className: "description",
        defaults: {
            isDone: false,
            urgent: false,
            dueDate: null,
            tags: [],
            description: "no description given"
        },
        initialize: function() {
            this.on("change", function(){ //listening for change on it's own attributes/events
                this.save(); //save is backbone; sends the info back online to parse.com, to specific id is given to object, automatically saves
            })
        }
    });
    Parse.TodoActualList = Parse.Collection.extend({
        model: Parse.TaskModel
    })


})(typeof module === "object" ? module.exports : window)


