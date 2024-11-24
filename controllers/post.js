// Importing User model
const User = require('../models/user');
// Importing Post model
const Post = require('../models/post');

// Creating post controlelrs
const getAllPosts = async (req, res) => {
    const {sortBy='id', order='ASC'} = req.query;
    try{
        // Getting all posts and the model vinculated with it (User) based on id
        const posts = await Post.findAll({
            order: [[sortBy, order.toUpperCase()]],
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['name']
                }
            ]
        });
        res.status(200).json(posts);
    } catch (err){
        res.status(500).json({
            message: 'Error retriving posts',
            error: err.message
        });
    }
}
// Get a posts by userid
const getPost = async (req, res) => {
    const {userid} = req.params;
    const {sortBy='id', order='ASC'} = req.query;
    try{
        const posts = await Post.findAll({
            where: {userid:userid},
            order: [[sortBy, order.toUpperCase()]],
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['name']
                }
            ]
        });
        res.status(200).json(posts);
    } catch (err){
        res.status(500).json({
            message: 'Error retriving post by id',
            error: err.message
        });
    }
}
// Create new Post by User id
const postUserPost = async (req, res) => {
    const {description, img_data=null, userid} = req.body;
    // Statement to block a different user to create a Post through another user
    if (req.user.id != userid){
        return res.status(403).json({
            message: 'Action denied.'
        });
    }
    // Creating new Post
    try{
        const newPost = await Post.create({description, img_data, userid});
        res.status(201).json({
            message: 'New Post created successfull',
            post: newPost
        });
    } catch (err){
        res.status(500).json({
            message: 'Create post by user id error',
            error: err.message
        });
    }
}
// Delete a post by postId and UserId
const deletePost = async (req, res) => {
    const {id} = req.params;
    try{
        // Get the Post by Id provided
        const post = await Post.findOne({
            where: {id}
        });
        // Checks if the post by Id provided exist
        if (!post){
            return res.status(404).json({
                message: 'Post does not exist.'
            });
        }
        // Checks if the userid in the auth is equals to post.userid
        if (req.user.id != post.userid){
            return res.status(403).json({
                message: 'Action denied.'
            });
        } 
        // Delete the post from database
        await Post.destroy({
            where: {id:id}
        });
        res.status(200).json({
            message: 'Post has been deleted successfuly',
            deletedPost: id
        });
    } catch(err){
        res.status(500).json({
            message: 'Delete Post error',
            error: err.message
        });
    }
    // res.send('DELETE a Post.');
}
// Exporting functions/methods
module.exports = {
    getAllPosts,
    getPost,
    postUserPost,
    deletePost
}