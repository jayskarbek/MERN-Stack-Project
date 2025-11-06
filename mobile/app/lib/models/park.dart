import 'rating_breakdown.dart';

class Park {
  const Park({
    required this.id,
    required this.name,
    this.description,
    this.city,
    this.state,
    this.imageUrl,
    this.averageRating,
    this.reviewCount,
    this.ratingBreakdown,
    this.metadata,
  });

  final String id;
  final String name;
  final String? description;
  final String? city;
  final String? state;
  final String? imageUrl;
  final double? averageRating;
  final int? reviewCount;
  final RatingBreakdown? ratingBreakdown;
  final Map<String, dynamic>? metadata;

  factory Park.fromJson(Map<String, dynamic> json) {
    double? _double(dynamic value) {
      if (value == null) return null;
      if (value is int) return value.toDouble();
      if (value is num) return value.toDouble();
      return double.tryParse(value.toString());
    }

    int? _int(dynamic value) {
      if (value == null) return null;
      if (value is int) return value;
      if (value is num) return value.toInt();
      return int.tryParse(value.toString());
    }

    String _string(dynamic value) {
      if (value == null) return '';
      return value.toString();
    }

    final ratingBreakdown = json['ratingBreakdown'] ?? json['ratings'];

    return Park(
      id: _string(json['_id'] ?? json['id']),
      name: _string(json['name'] ?? json['Name']),
      description:
          json['description']?.toString() ?? json['Description']?.toString(),
      city: json['city']?.toString() ?? json['City']?.toString(),
      state: json['state']?.toString() ?? json['State']?.toString(),
      imageUrl: json['imageUrl']?.toString() ??
          json['image_url']?.toString() ??
          json['Image']?.toString(),
      averageRating: _double(json['averageRating'] ?? json['avgRating']),
      reviewCount: _int(json['reviewCount'] ?? json['reviewsCount']),
      ratingBreakdown: ratingBreakdown is Map<String, dynamic>
          ? RatingBreakdown.fromJson(ratingBreakdown)
          : null,
      metadata: Map<String, dynamic>.from(json),
    );
  }
}
