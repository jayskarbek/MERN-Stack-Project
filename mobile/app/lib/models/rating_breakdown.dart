class RatingBreakdown {
  const RatingBreakdown({
    required this.views,
    required this.location,
    required this.amenities,
    this.overall,
  });

  final double views;
  final double location;
  final double amenities;
  final double? overall;

  factory RatingBreakdown.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      return const RatingBreakdown(
        views: 0,
        location: 0,
        amenities: 0,
      );
    }
    double _doubleValue(dynamic value) {
      if (value is int) return value.toDouble();
      if (value is num) return value.toDouble();
      return double.tryParse(value?.toString() ?? '') ?? 0;
    }

    return RatingBreakdown(
      views: _doubleValue(json['views']),
      location: _doubleValue(json['location']),
      amenities: _doubleValue(json['amenities']),
      overall: json.containsKey('overall')
          ? _doubleValue(json['overall'])
          : null,
    );
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'views': views,
        'location': location,
        'amenities': amenities,
        if (overall != null) 'overall': overall,
      };
}
