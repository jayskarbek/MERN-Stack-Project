import 'package:flutter/foundation.dart';

/// Utility methods for converting low-resolution Wikipedia thumbnail URLs
/// into higher quality variants that look sharper in the app.
class WikipediaImageHelper {
  const WikipediaImageHelper._();

  /// Converts a Wikipedia thumbnail URL to its full resolution version.
  ///
  /// Wikipedia thumbnail URLs typically look like:
  /// `.../thumb/a/ab/Filename.jpg/240px-Filename.jpg`.
  /// This method removes the `/thumb/` segment and the trailing `240px-`
  /// suffix so that the original asset is returned.
  static String getHighResolutionUrl(String imageUrl) {
    if (imageUrl.isEmpty) return imageUrl;

    try {
      if (imageUrl.contains('/thumb/') && imageUrl.contains('px-')) {
        var cleanUrl = imageUrl.replaceFirst('/thumb/', '/');
        final lastSlash = cleanUrl.lastIndexOf('/');

        if (lastSlash != -1) {
          final path = cleanUrl.substring(0, lastSlash);
          final filename = cleanUrl.substring(lastSlash + 1);

          final pxIndex = filename.indexOf('px-');
          if (pxIndex != -1) {
            final actualFilename = filename.substring(pxIndex + 3);
            return '$path/$actualFilename';
          }
        }
      }

      if (imageUrl.contains('.org/') && imageUrl.contains('/thumb/')) {
        final uri = Uri.parse(imageUrl);
        if (uri.queryParameters.containsKey('width')) {
          final params = Map<String, String>.from(uri.queryParameters)
            ..remove('width')
            ..remove('height');
          var cleanUrl = uri.replace(queryParameters: params).toString();
          cleanUrl = cleanUrl.replaceFirst('/thumb/', '/');
          if (cleanUrl.contains('px-')) {
            return _removeSizeSuffix(cleanUrl);
          }
          return cleanUrl;
        }
      }
    } catch (err) {
      debugPrint('Wikipedia URL conversion failed: $err');
      return imageUrl;
    }

    return imageUrl;
  }

  /// Returns an optimized image URL sized appropriately for mobile/tablet.
  static String getOptimizedUrl(String imageUrl, {int targetWidth = 1024}) {
    final baseUrl = getHighResolutionUrl(imageUrl);

    if (baseUrl.contains('wikimedia.org/') || baseUrl.contains('wikipedia.org/')) {
      try {
        var workingUri = Uri.parse(baseUrl);
        final segments = List<String>.from(workingUri.pathSegments);

        if (!segments.contains('thumb') && segments.length > 2) {
          segments.insert(2, 'thumb');
          workingUri = workingUri.replace(pathSegments: segments);
        }

        final uriString = workingUri.toString();
        final lastSlash = uriString.lastIndexOf('/');
        if (lastSlash != -1) {
          final filename = workingUri.pathSegments.last;
          final path = uriString.substring(0, lastSlash);
          return '$path/${targetWidth}px-$filename';
        }
      } catch (err) {
        debugPrint('Wikipedia optimize failure: $err');
      }
    }

    return baseUrl;
  }

  static String _removeSizeSuffix(String url) {
    final lastSlash = url.lastIndexOf('/');
    if (lastSlash != -1) {
      final path = url.substring(0, lastSlash);
      var filename = url.substring(lastSlash + 1);
      filename = filename.replaceFirst(RegExp(r'^\d+px-'), '');
      return '$path/$filename';
    }
    return url;
  }

  static bool isWikipediaImage(String url) =>
      url.contains('wikimedia.org/') || url.contains('wikipedia.org/');

  static String getDisplayUrl(String? imageUrl, {int targetWidth = 1024}) {
    if (imageUrl == null || imageUrl.isEmpty) return '';
    if (isWikipediaImage(imageUrl)) {
      return getOptimizedUrl(imageUrl, targetWidth: targetWidth);
    }
    return imageUrl;
  }
}

extension WikipediaImageExtension on String {
  String get highResolution => WikipediaImageHelper.getHighResolutionUrl(this);

  String optimized({int width = 1024}) =>
      WikipediaImageHelper.getOptimizedUrl(this, targetWidth: width);
}
