#import "CDFace.h"
#import "LDRegisterVC.h"
#import "LDVideoViewController.h"
#import "DetectionPersonManager.h"
@implementation CDFace

- (void)register:(CDVInvokedUrlCommand*)command
{
    
    _callbackId = [command callbackId];
    NSString* name = [[command arguments] objectAtIndex:0];
    //    NSString* name = @"linhehe22";
    NSString* msg = [NSString stringWithFormat: @"Hello, %@", name];
    LDRegisterVC *vc = [[LDRegisterVC alloc] initWithNibName:nil bundle:nil];
    vc.Name = name;
    
    [super.viewController presentViewController:vc animated:true completion:nil];
    
    //
    [[NSNotificationCenter defaultCenter]addObserver:self selector:@selector(onRegisterSucceed:) name:@"register" object:nil];
    //
    
}
-(void)search:(CDVInvokedUrlCommand*)command
{
    //
    _callbackId = [command callbackId];
    
    //    NSString* name = @"linhehe22";
    NSString* name = [[command arguments] objectAtIndex:0];
    
    [[DetectionPersonManager shareManager] searchPerson: name  finsh:^(id xxx){
        //
        if([xxx isKindOfClass:[NSError class]] == false)
        {
            NSString* msg =[NSString stringWithFormat:@"{\"op\":\"search\",\"result\":\"success\"}"];
            CDVPluginResult* result = [CDVPluginResult
                                       resultWithStatus:CDVCommandStatus_OK
                                       messageAsString:msg];
            [result setKeepCallbackAsBool:true];
            
            [self success:result callbackId:_callbackId];
            
        }else
        {
            NSString* msg =[NSString stringWithFormat:@"{\"op\":\"search\",\"result\":\"fail\"}"];
            CDVPluginResult* result = [CDVPluginResult
                                       resultWithStatus:CDVCommandStatus_OK
                                       messageAsString:msg];
            [result setKeepCallbackAsBool:true];
            
            [self success:result callbackId:_callbackId];
        }
        //
    }];
    //
}
-(void)onRegisterSucceed:(NSNotification*)notify
{
    
    NSString* imagePath = [notify.userInfo valueForKey:@"image"];
    NSString* result = [notify.userInfo valueForKey:@"result"];
    NSString* msg =[NSString stringWithFormat:@"{\"op\":\"register\",\"result\":\"%@\",\"imagePath\":\"%@\"}",result,imagePath];
    CDVPluginResult* res = [CDVPluginResult
                            resultWithStatus:CDVCommandStatus_OK
                            messageAsString:msg];
    [res setKeepCallbackAsBool:true];
    
    [self success:res callbackId:_callbackId];
    [[NSNotificationCenter defaultCenter] removeObserver:self name:@"register" object:nil];
    
}
-(void)onVerifySucceed:(NSNotification*)notify
{
    
    NSString* ok = [notify.userInfo valueForKey:@"ok"];
    NSString* msg =[NSString stringWithFormat:@"{\"op\":\"verify\",\"result\":\"%@\"}",ok];
    CDVPluginResult* result = [CDVPluginResult
                               resultWithStatus:CDVCommandStatus_OK
                               messageAsString:msg];
    [result setKeepCallbackAsBool:true];
    
    [self success:result callbackId:_callbackId];
    [[NSNotificationCenter defaultCenter] removeObserver:self name:@"verify" object:nil];
}
- (void)verify:(CDVInvokedUrlCommand*)command
{
    
    _callbackId = [command callbackId];
    [[NSNotificationCenter defaultCenter]addObserver:self selector:@selector(onVerifySucceed:) name:@"verify" object:nil];
    NSString* name = [[command arguments] objectAtIndex:0];
    
    [[DetectionPersonManager shareManager] setFinishCheck:YES];
    [[DetectionPersonManager shareManager] setUserId:name];
    LDVideoViewController *takeVC = [[LDVideoViewController alloc] initWithNibName:@"LDVideoViewController" bundle:nil];
    [super.viewController presentViewController:takeVC animated:true completion:nil];//; pushViewController:takeVC animated:true];
    
}
@end