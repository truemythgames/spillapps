#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(VerseWidgetBridge, NSObject)

RCT_EXTERN_METHOD(updateWidget:(NSString *)verseText
                  ref:(NSString *)verseRef
                  storyId:(NSString *)storyId
                  coverUrl:(NSString *)coverUrl
                  coverBase64:(NSString *)coverBase64
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(refreshTimeline:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(isWidgetInstalled:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

@end
