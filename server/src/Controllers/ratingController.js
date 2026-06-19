import Rating from '../Models/Rating.js'
import {Product} from '../Models/Product.js';

export const submitRating = async (req, res) => {
  try {
    const { rating, review, productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    // Convert to number safely


    // Validate rating
    if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be a number between 1 and 5" });
    }

    // Check if user already rated this product
    let existingRating = await Rating.findOne({
      userId: req.user.id,
      productId,
    });
   
    let isUpdate = false;
    if (existingRating) {
      existingRating.rating = rating;
      existingRating.review = review;
      await existingRating.save();
      isUpdate = true;
    } else {
      existingRating = new Rating({
        userId: req.user.id,
        productId,
        rating: rating,
        review,
      });
      await existingRating.save();
    }

    // Recalculate product average
    const ratings = await Rating.find({ productId });
    console.log(ratings)

    const averageRating =
      ratings.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) /
      ratings.length;

    await Product.findByIdAndUpdate(productId, {
      rating: Number(averageRating.toFixed(1)),
      reviewCount: ratings.length,
    });
   
    res.json({
      message: isUpdate ? "Review updated successfully" : "Rating submitted successfully",
      rating: existingRating,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: "Error submitting rating",
      error: error.message,
    });
  }
};

// controller: ratingController.js
export const getProductRatings = async (req, res) => {
  try {
    const { slug } = req.params;

    const reviews = await Rating.find({ slug: slug })
      .populate("userId", "username name phone") // show user info in review
      .sort({ createdAt: -1 });
     

    res.json({
      success: true,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load reviews", error: error.message });
  }
};


export const getUserRating = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const rating = await Rating.findOne({ 
      userId: req.user.id, 
      productId 
    });
    
    res.json(rating || null);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user rating', error: error.message });
  }
};

export const getProductReviews = async (req, res) => {
  try {
   

    const reviews = await Rating.find()
      .populate({
        path: "userId",
        select: "username name "
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews"
    });
  }
};




