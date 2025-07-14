import asyncHandler from "express-async-handler";
import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { getAuth } from "@clerk/express";

export const getComments = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    
    const comments = await Comment.find({ post: postId })
        .populate('user', 'username firstName lastName profilePicture')
        .sort({ createdAt: -1 });

    res.status(200).json({ comments });
});

export const createComment = asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === '') {
        return res.status(400).json({ error: 'Comment content cannot be empty' });
    }

    const user = await User.findById({ clerkId: userId });
    const post = await Post.findById(postId);

    const comment = await Comment.create({
        user: user._id,
        post: post._id,
        content
    });

    // link the comment to the post
    await Post.findByIdAndUpdate(post._id, {
        $push: { comments: comment._id }
    });

    // create a notification for the post author
    if (post.user.toString() !== user._id.toString()) {
        await Notification.create({
            from: user._id,
            to: post.user,
            type: 'comment',
            post: post._id,
            comment: comment._id,
        });
    }
    res.status(201).json({ comment });
});

export const deleteComment = asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    const { commentId } = req.params;

    const user = await User.findById({ clerkId: userId });
    const comment = await Comment.findById(commentId);

    if (!user || !comment) {
        return res.status(404).json({ error: 'User or Comment not found' });
    }

    if (comment.user.toString() !== user._id.toString()) {
        return res.status(403).json({ error: 'You can only delete your own comments' });
    }

    // Remove the comment from the post
    await Post.findByIdAndUpdate(comment.post, {
        $pull: { comments: comment._id }
    });

    // Delete the comment
    await Comment.findByIdAndDelete(commentId);
    
   res.status(204).send({ message: 'Comment deleted successfully' });
});