import 'rating_breakdown.dart';

class Review {
  const Review({
    required this.id,
    required this.parkId,
    required this.userId,
    required this.comment,
    required this.createdAt,
    this.updatedAt,
    required this.ratings,
  });

  final String id;
  final String parkId;
  final String userId;
  final String comment;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final RatingBreakdown ratings;

  factory Review.fromJson(Map<String, dynamic> json) {
    final created =
        DateTime.tryParse(json['createdAt']?.toString() ?? '') ?? DateTime.now();
    final updated =
        DateTime.tryParse(json['updatedAt']?.toString() ?? '');

    final parkIdValue =
        json['parkId']?.toString() ?? json['park_id']?.toString() ?? '';

    return Review(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      parkId: parkIdValue,
      userId: (json['userId'] ?? json['user_id'] ?? 'anonymous').toString(),
      comment: (json['comment'] ?? '').toString(),
      createdAt: created,
      updatedAt: updated,
      ratings: RatingBreakdown.fromJson(
        (json['ratings'] ?? json['rating']) as Map<String, dynamic>?,
      ),
    );
  }
}

class ReviewSubmission {
  const ReviewSubmission({
    required this.views,
    required this.location,
    required this.amenities,
    required this.comment,
  });

  final double views;
  final double location;
  final double amenities;
  final String comment;

  Map<String, dynamic> toJson({String? userId}) {
    return <String, dynamic>{
      'ratings': <String, dynamic>{
        'views': views,
        'location': location,
        'amenities': amenities,
      },
      'comment': comment,
      if (userId != null) 'userId': userId,
    };
  }
}
