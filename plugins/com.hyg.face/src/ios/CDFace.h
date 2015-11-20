#import <Cordova/CDV.h>
@interface CDFace : CDVPlugin
{
    NSString* _callbackId;
}
- (void) register:(CDVInvokedUrlCommand*)command;
-(void)verify:(CDVInvokedUrlCommand*)command;
@end