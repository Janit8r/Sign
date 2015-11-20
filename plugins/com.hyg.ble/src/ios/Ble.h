#import <CoreBluetooth/CoreBluetooth.h>
#import <Cordova/CDV.h>
@interface Ble : CDVPlugin<CBCentralManagerDelegate>
{
    CBCentralManager * manager;
    NSString* _name;
    NSString* _callId;
    NSTimer * _timer;
}
- (void) scanBlue:(CDVInvokedUrlCommand*)command;

@end
