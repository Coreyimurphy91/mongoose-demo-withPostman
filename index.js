const express = require('express');
require('dotenv').config();
const app = express();
const mongoose = require('mongoose');
const Post = require('./schemas/post');
const User = require('./schemas/user');
const Comment = require('./schemas/comment');
// const { CommentModel } = require('./schemas/comment')

const MONGO_CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING;

mongoose.connect(MONGO_CONNECTION_STRING, {useNewUrlParser: true});
const db = mongoose.connection;

db.once('open', () => {
    console.log(`Connected to mongoDb at ${db.host}:${db.port}`)
})

db.on('error', (error) => {
    console.log(`Database Error: ${error}`)
})


app.use(express.urlencoded( {extended: false }));

app.get('/', (req, res) => {
    res.json({
        message: 'welcome to our API'
    })
})

app.get('/users', (req, res) => {
    User.find({})
    .then(users => {
        console.log('All users', users);
        res.json({ users: users });
    })
    .catch(error => { 
        console.log('error', error);
        res.json({ message: "Error ocurred, please try again" });
    });
});

app.get('/users/:email', (req, res) => {
    console.log('find user by', req.params.email)
    User.findOne({
        email: req.params.email
    })
    .then(user => {
        console.log('Here is the user', user.name);
        res.json({ user: user });
    })
    .catch(error => { 
        console.log('error', error);
        res.json({ message: "Error ocurred, please try again" });
    });
});

app.post('/users', (req, res) => {
    User.create({
        name: req.body.name,
        email: req.body.email,
        meta: {
            age: req.body.age,
            website: req.body.website
        }
    })
    .then(user => {
        console.log('New user =>>', user);
        res.json({ user: user });
    })
    .catch(error => { 
        console.log('error', error) 
        res.json({ message: "Error ocurred, please try again" })
    });
});

app.put('/users/:email', (req, res) => {
    console.log('route is being on PUT')
    User.findOne({ email: req.params.email })
    .then(foundUser => {
        console.log('User found', foundUser);
        User.findOneAndUpdate({ email: req.params.email }, 
        { 
            name: req.body.name ? req.body.name : foundUser.name,
            email: req.body.email ? req.body.email : foundUser.email,
            meta: {
                age: req.body.age ? req.body.age : foundUser.age,
                website: req.body.website ? req.body.website : foundUser.website
            }
        })
        .then(user => {
            console.log('User was updated', user);
            res.redirect(`/users/${req.params.email}`)
        })
        .catch(error => {
            console.log('error', error) 
            res.json({ message: "Error ocurred, please try again" })
        })
    })
    .catch(error => {
        console.log('error', error) 
        res.json({ message: "Error ocurred, please try again" })
    })
    
});

app.delete('/users/:email', (req, res) => {
    User.findOneAndRemove({ email: req.params.email })
    .then(response => {
        console.log('This was deleted', response);
        res.json({ message: `${req.params.email} was deleted`});
    })
    .catch(error => {
        console.log('error', error) 
        res.json({ message: "Error ocurred, please try again" });
    })
});

// ================ POSTS ROUTES ========================

app.get('/posts', (req, res) => {
    Post.find({})
    .then(posts => {
        console.log('All posts', posts);
        res.json({ posts: posts });
    })
    .catch(error => { 
        console.log('error', error)
        res.json({ message: "Error ocurred, please try again"})
    });
});

app.get('/posts/:id/comments', (req, res) => {
    Post.findById(req.params.id).populate('comments').exec()
    .then(post => {
        console.log('Here is the post', post);
        res.json({ posts: posts });
    })
    .catch(error => { 
        console.log('error', error)
        res.json({ message: "Error ocurred, please try again"})
    });
});

// app.get('/posts/:title', (req, res) => {
//     console.log('find post by', req.params.title)
//     Post.findOne({
//         title: req.params.title
//     })
//     .then(post => {
//         console.log('Here is the post', post.title);
//         res.json({ post: post });
//     })
//     .catch(error => { 
//         console.log('error', error);
//         res.json({ message: "Error ocurred, please try again" });
//     });
// });

app.get('/posts/:id', (req, res) => {
    console.log('find post by ID', req.params.id);
    // console.log(mongoose.Types.ObjectId(req.params.id))
    Post.findOne({ _id: mongoose.Types.ObjectId(req.params.id) })
    .then(post => {
        console.log('Here is the post', post);
        res.json({ post: post });
    })
    .catch(error => { 
        console.log('error', error);
        res.json({ message: "Error ocurred, please try again" });
    });
});

app.post('/posts', (req, res) => {
    Post.create({
        title: req.body.title,
        body: req.body.body
    })
    .then(post => {
        console.log('New post =>>', post);
        res.json({ post: post });
})
    .catch(error => { 
        console.log('error', error) 
        res.json({ message: "Error ocurred, please try again" })
    });
});

app.put('/posts/:id', (req, res) => {
    console.log('route is being on PUT')
    Post.findById(req.params.id)
    .then(foundPost => {
        console.log('Post found', foundPost);
        Post.findByIdAndUpdate(req.params.id, 
        { 
            title: req.body.title ? req.body.title : foundPost.title,
            body: req.body.body ? req.body.body : foundPost.body
        }, {
            upsert: true
        })
        .then(post => {
            console.log('Post was updated', post);
            res.redirect(`/posts/${req.params.id}`)
        })
        .catch(error => {
            console.log('error', error) 
            res.json({ message: "Error ocurred, please try again" })
        })
    })
    .catch(error => {
        console.log('error', error) 
        res.json({ message: "Error ocurred, please try again" })
    })
});

app.delete('/posts/:id', (req, res) => {
    Post.findByIdAndRemove(req.params.id)
    .then(response => {
        console.log('This was deleted', response);
        res.json({ message: `Post ${req.params.id} was deleted by id`});
    })
    .catch(error => {
        console.log('error', error) 
        res.json({ message: "Error ocurred, please try again" });
    })
});

// ================ COMMENTS ROUTES ========================

app.get('/comments', (req, res) => {
    Comment.find({})
    .then(comments => {
        console.log('All comments', comments);
        res.json({ comments: comments });
    })
    .catch(error => { 
        console.log('error', error) 
    });
});

app.get('/comments/:id', (req, res) => {
    console.log('find comment by ID', req.params.id);
    // console.log(mongoose.Types.ObjectId(req.params.id))
    Comment.findOne({ _id: mongoose.Types.ObjectId(req.params.id) })
    .then(comment => {
        console.log('Here is the comment', comment);
        res.json({ comment: comment });
    })
    .catch(error => { 
        console.log('error', error);
        res.json({ message: "Error ocurred, please try again" });
    });
});

app.post('/posts/:id/comments', (req, res) => {
    Post.findById(req.params.id)
    .then(post => {
        console.log('Heyyy, this is the post', post);
        // create and pust comment inside of post
        Comment.create({
            header: req.body.header,
            content: req.body.content
        })
        .then(comment => {
            post.comments.push(comment);
            // save the post
            post.save();
            res.redirect(`/posts/${req.params.id}`);
        })
        .catch(error => { 
            console.log('error', error);
            res.json({ message: "Error ocurred, please try again" });
        });
    })
    .catch(error => { 
        console.log('error', error);
        res.json({ message: "Error ocurred, please try again" });
    });
});

// app.put('/comments/:header', (req, res) => {
//     console.log('route is being on PUT')
//     Comment.findOne({ header: req.params.header })
//     .then(foundComment => {
//         console.log('Comment found', foundComment);
//         Comment.findOneAndUpdate({ header: req.params.header }, 
//         { 
//             header: req.body.header ? req.body.header : foundComment.header,
//             content: req.body.content ? req.body.content : foundComment.content,
//             date: new Date()
            
//         })
//         .then(comment => {
//             console.log('comment was updated', comment);
//             res.redirect(`/comments/${req.params.id}`)
//         })
//         .catch(error => {
//             console.log('error', error) 
//             res.json({ message: "Error ocurred, please try again" })
//         })
//     })
//     .catch(error => {
//         console.log('error', error) 
//         res.json({ message: "Error ocurred, please try again" })
//     })
// });

app.put('/comments/:id', (req, res) => {
    console.log('route is being on PUT')
    Comment.findById(req.params.id)
    .then(foundComment => {
        console.log('Comment found', foundComment);
        Comment.findByIdAndUpdate(req.params.id, 
        { 
            header: req.body.header ? req.body.header : foundComment.header,
            content: req.body.content ? req.body.content : foundComment.content
        }, {
            upsert: true
        })
        .then(comment => {
            console.log('comment was updated', comment);
            res.redirect(`/comments/${req.params.id}`)
        })
        .catch(error => {
            console.log('error', error) 
            res.json({ message: "Error ocurred, please try again" })
        })
    })
    .catch(error => {
        console.log('error', error) 
        res.json({ message: "Error ocurred, please try again" })
    })
});

app.delete('/comments/:id', (req, res) => {
    Comment.findByIdAndRemove(req.params.id)
    .then(response => {
        console.log('This comment was deleted', response);
        res.json({ message: `${req.params.id} was deleted`});
    })
    .catch(error => {
        console.log('error', error) 
        res.json({ message: "Error ocurred, please try again" });
    })
});



// app.get('/', (req, res) => {
//     const bobby = new User({
//         name: 'Bobby',
//         email: 'Bobby@gmail.com',
//         meta: {
//             age: 30,
//             website: 'https://Bobby.me'
//         }
//     });
    
//     bobby.save((err) => {
//         if (err) return console.log(err);
//         console.log('User Created!')
//     })
//     res.send(bobby.sayHello());
// })

// app.get('findAll', (req, res) => {
//     User.find({}, (err, users) => {
//         if (err) res.send(`Failed to find record, mongodb error ${err}`) 
//         res.send(users);
//     })
// })

// app.get('findById/:id', (req, res) => {
//     User.findById(req.params.id, (err, users) => {
//         if (err) res.send(`Failed to find record, mongodb error ${err}`) 
//         res.send(users);
//     })
// })

// app.get('findByEmail/:email', (req, res) => {
//     User.findOne({email: req.params.email}, (err, users) => {
//         if (err) res.send(`Failed to find record by email, mongodb error ${err}`) 
//         res.send(users);
//     })
// })

// Mongoose create statements
// User.create({
//     name: 'created using creat()',
//     email: 'tester@gmail.com'
// })

// const newUser = new User({
//     name: 'created using new User and Save()',
//     email: 'tester2@gmail.com'
// })

// newUser.save((err) => {
//     if (err) return console.log(err);
//     console.log('created new user')
// })

// Post.create({
//     content: 'This is post content...'
// })

// Mongoose update statements
// User.updateOne({name: 'created using new User and Save()'}, {
//     meta: {
//         name: 'Robert'
//     }
// }, (err, updateOutcome) => {
//     if(err) return console.log(err);
//     console.log(`updated user: ${updateOutcome.matchedCount}, ${updateOutcome.modifiedCount}`)
// })

// User.findOneAndUpdate({name: 'created using new User and Save()'}, {
//     meta: {
//         age: 61,
//         website: 'SomeNewSite@gma.com'
//     }
// }, (err, user) => {
//     if(err) return console.log(err);
//     console.log(user);
// })


// Mongoose delete statements

// User.remove({name: 'created using new User and Save()'}, (err) => {
//     if(err) return console.log(err);
//     console.log('user record deleted')
// })

// User.findOneAndRemove({name: 'created using new User and Save()'}, (err, user) => {
//     if (err) return console.log(err);
//     console.log(user);
// })

// Post schema with association to comments

// const newPost = new Post({
//     title: 'Our first post',
//     body: 'Some body for our first text post'
// })

// newPost.comments.push({
//     header: 'Our first comment',
//     content: 'This is my comment text for my first comment'
// })

// newPost.save(function(err) {
//     if(err) return console.log(err);
//     console.log(`Created Post`)
// })

// const refPost = new Post({
//     title: 'Post with ref to comments',
//     body: 'Body for ref by comments'
// });

// const refComment = new CommentModel({
//     header: 'Our ref comment',
//     content: 'Some comment content'
// })

// refComment.save();

// refPost.refComments.push(refComment);
// refPost.save();

// Find ALL comments ona  post by ref
// Post.findOne({}, (err, post) => {
//     Post.findById(post._id).populate('comments').exec((err, post) => {
//         console.log(post)
//     });
// })


app.listen(8000, () => {
    console.log('running on 8000')
})