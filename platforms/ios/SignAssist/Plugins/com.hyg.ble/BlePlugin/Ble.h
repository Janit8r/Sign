#import <CoreBluetooth/CoreBluetooth.h>
#import <Cordova/CDV.h>
@interface Ble : CDVPlugin<CBCentralManagerDelegate>
{
    CBCentralManager * manager;
    NSString* _name;
    NSString* _callId;
    NSTimer * _timer;
    int _opMode;
    
    BMKLocationService* _locService;
    float _lat;
    float _lng;
}
- (void) scanBlue:(CDVInvokedUrlCommand*)command;
-(void)scanGps:(CDVInvokedUrlCommand*)command;
-(void)supportBle:(CDVInvokedUrlCommand*)command;
-(void)exit:(CDVInvokedUrlCommand*)command;
@end