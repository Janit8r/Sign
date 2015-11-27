#import <BaiduMapAPI_Location/BMKLocationService.h>
#import <BaiduMapAPI_Utils/BMKUtilsComponent.h>

#import "Ble.h"
@implementation Ble


-(void)scanGps:(CDVInvokedUrlCommand*)command
{
    //初始化BMKLocationService
    NSLog(@"scanGps");
    _locService = [[BMKLocationService alloc]init];
    _locService.delegate = self;
    _callId =command.callbackId;
    //
    _lat  = [[command argumentAtIndex:0] floatValue];
    _lng =[[command argumentAtIndex:1] floatValue];;
    //启动LocationService
    _opMode=3;
    [_locService startUserLocationService];
    _timer = [NSTimer scheduledTimerWithTimeInterval:5.0 target:self selector:@selector(stopLocation:) userInfo:nil repeats:NO];
}
- (void)scanBlue:(CDVInvokedUrlCommand*)command
{
    
    NSLog(@"scanBlue");
    _name  = [command argumentAtIndex:0];
    _callId =command.callbackId;
    manager = [[CBCentralManager alloc] initWithDelegate:self queue:nil];
    
 
    _opMode=2;
    
    
}
-(void)stopLocation:(NSTimer *)theTimer
{
    NSLog(@"stopLocation");
    
     [_locService stopUserLocationService];
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"{\"result\":\"fail\",\"type\":\"gps\",\"msg\":\"请打开定位\"}"];
    [pluginResult setKeepCallbackAsBool:YES]; // here we tell Cordova not to cleanup the callback id after
    [self.commandDelegate sendPluginResult:pluginResult callbackId:_callId];
    [manager stopScan];
    _opMode=0;
    
}
- (void)didUpdateBMKUserLocation:(BMKUserLocation *)userLocation
{
    NSLog(@"didUpdateBMKUserLocation");

    [_locService stopUserLocationService ];
       [_timer invalidate];
    CLLocationDistance dis;
    dis = BMKMetersBetweenMapPoints(BMKMapPointForCoordinate(userLocation.location.coordinate), BMKMapPointForCoordinate(CLLocationCoordinate2DMake(_lat,_lng))) ;
    NSString* result;
    if(dis <100)
    {
        //
        result = @"{\"result\":\"success\"}";
        //
    }else{
        result = @"{\"result\":\"fail\",\"msg\":\"你不在规定的地点签到,如果你确实在规定的地点，请到室外进行签到\"}";
    }
    
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:result];
    [pluginResult setKeepCallbackAsBool:YES]; // here we tell Cordova not to cleanup the callback id after
    [self.commandDelegate sendPluginResult:pluginResult callbackId:_callId];
    _opMode=0;
    //NSLog(@"didUpdateUserLocation lat %f,long %f",userLocation.location.coordinate.latitude,userLocation.location.coordinate.longitude);
}
-(void)action:(NSTimer *)theTimer
{
    NSLog(@"action");

    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"{\"result\":\"fail\",\"type\":\"blue\"}"];
    [pluginResult setKeepCallbackAsBool:YES]; // here we tell Cordova not to cleanup the callback id after
    [self.commandDelegate sendPluginResult:pluginResult callbackId:_callId];
    [manager stopScan];
    _opMode=0;
   
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
        {
            [nsmstring appendString:@"Unsupport\n"];
            CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"{\"result\":\"gps\"}"];
            [pluginResult setKeepCallbackAsBool:YES];
            [self.commandDelegate sendPluginResult:pluginResult callbackId:_callId];
            _opMode=0;
        }
            break;
        case CBCentralManagerStateUnauthorized:
            [nsmstring appendString:@"Unauthorized\n"];
            break;
        case CBCentralManagerStateResetting:
            [nsmstring appendString:@"Resetting\n"];
            break;
        case CBCentralManagerStatePoweredOff:
            {
                [nsmstring appendString:@"PoweredOff\n"];
                
                CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"{\"result\":\"false\"}"];
                [pluginResult setKeepCallbackAsBool:YES];
                [self.commandDelegate sendPluginResult:pluginResult callbackId:_callId];
                _opMode=0;
            }
            //            if (connectedPeripheral!=NULL){
            //                [CM cancelPeripheralConnection:connectedPeripheral];
            //            }
            break;
        case CBCentralManagerStatePoweredOn:
        {
            [nsmstring appendString:@"PoweredOn\n"];
            
            NSDictionary        *options        = [NSDictionary dictionaryWithObject:[NSNumber numberWithBool:NO] forKey:CBCentralManagerScanOptionAllowDuplicatesKey];
            if(_opMode==2)
            {
                [manager scanForPeripheralsWithServices:nil options:options];
                _timer = [NSTimer scheduledTimerWithTimeInterval:3.0 target:self selector:@selector(action:) userInfo:nil repeats:NO];
               
            }else if(_opMode ==1){
                CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"{\"result\":\"ble\"}"];
                [pluginResult setKeepCallbackAsBool:YES];
                [self.commandDelegate sendPluginResult:pluginResult callbackId:_callId];
                _opMode=0;
            }
        }

            break;
        default:
          
            break;
    }
    NSLog(@"%@",nsmstring);
    //    [delegate didUpdateState:isWork message:nsmstring getStatus:cManager.state];
}
-(void)exit:(CDVInvokedUrlCommand*)command
{
    exit(0);
}
-(void)centralManager:(CBCentralManager *)central didDiscoverPeripheral:(CBPeripheral *)peripheral advertisementData:(NSDictionary *)advertisementData RSSI:(NSNumber *)RSSI
{
      NSLog(@"didDisCoverPeripheral");
    if([[advertisementData objectForKey:@"kCBAdvDataLocalName"] isEqual:_name])
    {
        [_timer invalidate];
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"{\"result\":\"success\",\"type\":\"blue\"}"];
        [pluginResult setKeepCallbackAsBool:YES]; // here we tell Cordova not to cleanup the callback id after
        [self.commandDelegate sendPluginResult:pluginResult callbackId:_callId];
        _opMode=0;
    }
    
}
-(void)supportBle:(CDVInvokedUrlCommand*)command
{
    NSLog(@"Ble");
    manager = [[CBCentralManager alloc] initWithDelegate:self queue:nil];
     _callId =command.callbackId;
    _opMode=1;
}
@end