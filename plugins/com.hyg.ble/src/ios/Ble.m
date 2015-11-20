#import "Ble.h"
@implementation Ble

- (void)scanBlue:(CDVInvokedUrlCommand*)command
{
        _name  = [command argumentAtIndex:0];
        _callId = command.callbackId;
        manager = [[CBCentralManager alloc] initWithDelegate:self queue:nil];

        _timer = [NSTimer scheduledTimerWithTimeInterval:3.0 target:self selector:@selector(action:) userInfo:nil repeats:NO];


}
-(void)action:(NSTimer *)theTimer
{
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"fail"];
    [pluginResult setKeepCallbackAsBool:YES]; // here we tell Cordova not to cleanup the callback id after
    [self.commandDelegate sendPluginResult:pluginResult callbackId:_callId];
    [manager stopScan];
}
-(void)centralManagerDidUpdateState:(CBCentralManager*)cManager
{
    NSMutableString* nsmstring=[NSMutableString stringWithString:@"UpdateState:"];
    BOOL isWork=FALSE;
    switch (cManager.state) {
        case CBCentralManagerStateUnknown:
            [nsmstring appendString:@"Unknown\n"];
            break;
        case CBCentralManagerStateUnsupported:
            [nsmstring appendString:@"Unsupported\n"];
            break;
        case CBCentralManagerStateUnauthorized:
            [nsmstring appendString:@"Unauthorized\n"];
            break;
        case CBCentralManagerStateResetting:
            [nsmstring appendString:@"Resetting\n"];
            break;
        case CBCentralManagerStatePoweredOff:
            [nsmstring appendString:@"PoweredOff\n"];
//            if (connectedPeripheral!=NULL){
//                [CM cancelPeripheralConnection:connectedPeripheral];
//            }
            break;
        case CBCentralManagerStatePoweredOn:
        {
            NSDictionary        *options        = [NSDictionary dictionaryWithObject:[NSNumber numberWithBool:NO] forKey:CBCentralManagerScanOptionAllowDuplicatesKey];

            [manager scanForPeripheralsWithServices:nil options:options];
        }
            [nsmstring appendString:@"PoweredOn\n"];
            isWork=TRUE;
            break;
        default:
            [nsmstring appendString:@"none\n"];
            break;
    }
    NSLog(@"%@",nsmstring);
//    [delegate didUpdateState:isWork message:nsmstring getStatus:cManager.state];
}
-(void)centralManager:(CBCentralManager *)central didDiscoverPeripheral:(CBPeripheral *)peripheral advertisementData:(NSDictionary *)advertisementData RSSI:(NSNumber *)RSSI
{
    if([[advertisementData objectForKey:@"kCBAdvDataLocalName"] isEqual:_name])
    {
        [_timer invalidate];
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"success"];
        [pluginResult setKeepCallbackAsBool:YES]; // here we tell Cordova not to cleanup the callback id after
        [self.commandDelegate sendPluginResult:pluginResult callbackId:_callId];
    }

}
