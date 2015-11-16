//
//  TakePhotoVC.m
//  KoalaPhoto
//
//  Created by 张英堂 on 14/11/13.
//  Copyright (c) 2014年 visionhacker. All rights reserved.
//

#import "LDVideoViewController.h"
#import <AVFoundation/AVFoundation.h>
#import "MovieRecorder.h"
#import "YTMacro.h"
#import "LivenessDetector.h"

#import "BottomAnimationView.h"
#import "CountZeroManager.h"
#import "UIView+convenience.h"
#import "ImhtPlayAudio.h"
#import "DetectionPersonManager.h"

#define RECORD_AUDIO 0  //录像时，是否保存声音

@interface LDVideoViewController ()<AVCaptureVideoDataOutputSampleBufferDelegate,AVCaptureAudioDataOutputSampleBufferDelegate , MGLivenessProtocolDelegate,MovieRecorderDelegate>
{
    NSInteger _curStep;
    
    AVCaptureConnection *_audioConnection;
    AVCaptureConnection *_videoConnection;
    
    NSDictionary *_audioCompressionSettings;
}

@property (nonatomic, strong) AVCaptureSession *session;
@property (nonatomic, strong) AVCaptureDeviceInput *videoInput;
@property (nonatomic, strong) AVCaptureVideoPreviewLayer *previewLayer;

@property(nonatomic, readwrite) AVCaptureVideoOrientation videoOrientation;
@property(nonatomic, retain) __attribute__((NSObject)) CMFormatDescriptionRef outputVideoFormatDescription;
@property(nonatomic, retain) __attribute__((NSObject)) CMFormatDescriptionRef outputAudioFormatDescription;

@property (nonatomic, strong) MGLivenessDetector *livenessDetector;
@property (nonatomic, assign) BOOL starLiveness;
@property (nonatomic, strong) BottomAnimationView *bottomView;

@property (nonatomic, strong) NSMutableArray *actionArray;

@property (nonatomic, strong) MovieRecorder *movieRecorder;

@end


@implementation LDVideoViewController

-(void)dealloc{
    self.movieRecorder = nil;
   }

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    [self initialSession];
    [self.navigationController setNavigationBarHidden:YES];
    self.shouldMovie = [[DetectionPersonManager shareManager] ldDebug];
    
    NSDictionary *options = [NSDictionary dictionaryWithObjectsAndKeys:[[NSBundle mainBundle] pathForResource:@"model" ofType:@""], MGLivenessDetectorModelPath, nil];
    self.livenessDetector = [MGLivenessDetector detectorOfOptions:options];
    [self.livenessDetector setDelegate:self];
    [self.livenessDetector reset];
    
    self.bottomView = [[BottomAnimationView alloc] initWithFrame:CGRectMake(0, WIN_WIDTH, WIN_WIDTH, WIN_HEIGHT-WIN_WIDTH)];
    [self.view addSubview:self.bottomView];
    
    if (WIN_HEIGHT == 480) {
        [self.bottomView setFrame:CGRectMake(0, WIN_WIDTH - 30, WIN_WIDTH, WIN_HEIGHT-WIN_WIDTH+30)];
    }
    
    [self restArray];
}

- (void)initHardCode:(BOOL)check{
    _starLiveness = check;
    _curStep = 0;
}

- (void)viewWillAppear:(BOOL)animated{
    [self setUpCameraLayer];
    [self willStatLiveness];
    
    [self initHardCodeWithCheckNO];
    
    if (self.session) {
        [self.session startRunning];
    }
}


-(void)viewWillDisappear:(BOOL)animated{
    [super viewWillDisappear:animated];
    _starLiveness = NO;
    
    if (self.session) {
        [self.session stopRunning];
    }
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

//初始化数据
- (void)initHardCodeWithCheckNO{
    [self initHardCode:NO];
}
- (void)initHardCodeWithCheckYES{
    [self initHardCode:YES];
}

/**
 *  重置 随机动作的数组
 */
- (void)restArray{
    self.actionArray = nil;
    self.actionArray = [NSMutableArray arrayWithObjects:@1, @2, @4, nil];
}

/**
 *  即将开始检测，显示倒计时
 */
- (void)willStatLiveness{
    [[[CountZeroManager alloc] init] starOpen];
    
    [self performSelector:@selector(starLivenessWithBuff) withObject:nil afterDelay:1.0f];
}

//开启检查
-(void)starLivenessWithBuff{
    [self.livenessDetector reset];
    _starLiveness = YES;
    
    MGLivenessDetectionType type = [self randActionType];
    
    [self.livenessDetector changeDetectionType:type];
    [self starAnimation:type];
}

//初始化相机
- (void) initialSession
{
    self.session = [[AVCaptureSession alloc] init];
    self.session.sessionPreset = AVCaptureSessionPreset640x480;
    /**
     *  视频
     */
    self.videoInput = [[AVCaptureDeviceInput alloc] initWithDevice:[self frontCamera] error:nil];
    if ([self.session canAddInput:self.videoInput]) {
        [self.session addInput:self.videoInput];
    }
    AVCaptureVideoDataOutput *output = [[AVCaptureVideoDataOutput alloc] init];
    if ([self.session canAddOutput:output]) {
        [self.session addOutput:output];
    }
    _videoConnection = [output connectionWithMediaType:AVMediaTypeVideo];
    self.videoOrientation = _videoConnection.videoOrientation;
    
    dispatch_queue_t queue = dispatch_queue_create("com.megvii.video", NULL);
    [output setSampleBufferDelegate:self queue:queue];
    
    output.videoSettings =[NSDictionary dictionaryWithObject:[NSNumber numberWithInt:kCVPixelFormatType_32BGRA]
                                                      forKey:(id)kCVPixelBufferPixelFormatTypeKey];
    
#if RECORD_AUDIO
    AVCaptureDevice *audioDevice = [AVCaptureDevice defaultDeviceWithMediaType:AVMediaTypeAudio];
    AVCaptureDeviceInput *audioIn = [[AVCaptureDeviceInput alloc] initWithDevice:audioDevice error:nil];
    if ( [self.session canAddInput:audioIn] ) {
        [self.session addInput:audioIn];
    }
    
    AVCaptureAudioDataOutput *audioOut = [[AVCaptureAudioDataOutput alloc] init];
    dispatch_queue_t audioCaptureQueue = dispatch_queue_create("com.megvii.audio", DISPATCH_QUEUE_SERIAL );
    [audioOut setSampleBufferDelegate:self queue:audioCaptureQueue];
    
    if ( [self.session canAddOutput:audioOut] ) {
        [self.session addOutput:audioOut];
    }
    _audioConnection = [audioOut connectionWithMediaType:AVMediaTypeAudio];
    output.alwaysDiscardsLateVideoFrames = YES;
    
    _audioCompressionSettings = [[audioOut recommendedAudioSettingsForAssetWriterWithOutputFileType:AVFileTypeQuickTimeMovie] copy];
#endif
    
}

//前后摄像头
- (AVCaptureDevice *)cameraWithPosition:(AVCaptureDevicePosition) position {
    NSArray *devices = [AVCaptureDevice devicesWithMediaType:AVMediaTypeVideo];
    for (AVCaptureDevice *device in devices) {
        if ([device position] == position) {
            return device;
        }
    }
    return nil;
}
- (AVCaptureDevice *)frontCamera {
    return [self cameraWithPosition:AVCaptureDevicePositionFront];
}
- (AVCaptureDevice *)backCamera {
    return [self cameraWithPosition:AVCaptureDevicePositionBack];
}
//前后摄像头的切换
- (void)toggleCamera:(id)sender{
    NSUInteger cameraCount = [[AVCaptureDevice devicesWithMediaType:AVMediaTypeVideo] count];
    if (cameraCount > 1) {
        NSError *error;
        AVCaptureDeviceInput *newVideoInput;
        AVCaptureDevicePosition position = [[_videoInput device] position];
        
        if (position == AVCaptureDevicePositionBack)
            newVideoInput = [[AVCaptureDeviceInput alloc] initWithDevice:[self frontCamera] error:&error];
        else if (position == AVCaptureDevicePositionFront)
            newVideoInput = [[AVCaptureDeviceInput alloc] initWithDevice:[self backCamera] error:&error];
        else
            return;
        
        if (newVideoInput != nil) {
            [self.session beginConfiguration];
            [self.session removeInput:self.videoInput];
            if ([self.session canAddInput:newVideoInput]) {
                [self.session addInput:newVideoInput];
                [self setVideoInput:newVideoInput];
            } else {
                [self.session addInput:self.videoInput];
            }
            [self.session commitConfiguration];
        } else if (error) {
            NSLog(@"toggle carema failed, error = %@", error);
        }
    }
}

//加载图层预览
- (void) setUpCameraLayer
{
    if (self.previewLayer == nil) {
        self.previewLayer = [[AVCaptureVideoPreviewLayer alloc] initWithSession:self.session];
        CALayer * viewLayer = [self.view layer];
        
        [self.previewLayer setFrame:CGRectMake(0, 0, WIN_WIDTH, WIN_HEIGHT*0.8)];
        [self.previewLayer setVideoGravity:AVLayerVideoGravityResizeAspectFill];
        
        [viewLayer insertSublayer:self.previewLayer below:[[viewLayer sublayers] objectAtIndex:0]];
    }
    
    [self.view bringSubviewToFront:self.bottomView];
}

//随机一个动作
- (MGLivenessDetectionType)randActionType{
    NSInteger type = arc4random()%(self.actionArray.count);
    
    MGLivenessDetectionType detectionType = (MGLivenessDetectionType)[self.actionArray[type] integerValue];
    [self.actionArray removeObjectAtIndex:type];
    
    return detectionType;
}

//播放动作提示动画
- (void)starAnimation:(MGLivenessDetectionType )type{
    [self.bottomView willChangeAnimation:type outTime:10];
    [self.bottomView startRollAnimation];
}


#pragma mark - delegate
- (void)captureOutput:(AVCaptureOutput *)captureOutput
didOutputSampleBuffer:(CMSampleBufferRef)sampleBuffer
       fromConnection:(AVCaptureConnection *)connection
{
    if (_starLiveness) {
        if (connection == _videoConnection)
        {
            [self.livenessDetector detectWithBuffer:sampleBuffer orientation:UIImageOrientationRight];
            
            if (self.shouldMovie) {
                [self testCompressionSession:sampleBuffer];
            }
        }else if (connection == _audioConnection){
            CMFormatDescriptionRef formatDescription = CMSampleBufferGetFormatDescription( sampleBuffer );
            self.outputAudioFormatDescription = formatDescription;
            [self addVideo:sampleBuffer];
        }
    }
}

//录像功能
- (void)testCompressionSession:(CMSampleBufferRef )pixelBuffer
{
    @synchronized(self){
        if (!self.movieRecorder) {
            NSString *moveName = [NSString stringWithFormat:@"%@.mov", [[DetectionPersonManager shareManager] getSaveMovieName]];
            NSURL *url = [[NSURL alloc] initFileURLWithPath:[NSString pathWithComponents:@[NSTemporaryDirectory(), moveName]]];
            
            self.movieRecorder = [[MovieRecorder alloc] initWithURL:url];
            
            CMFormatDescriptionRef formatDescription = CMSampleBufferGetFormatDescription( pixelBuffer );
            
            CGAffineTransform videoTransform = [self transformFromVideoBufferOrientationToOrientation:(AVCaptureVideoOrientation)UIDeviceOrientationPortrait withAutoMirroring:NO];
            
            [self.movieRecorder addVideoTrackWithSourceFormatDescription:formatDescription transform:videoTransform settings:nil];
            
            dispatch_queue_t callbackQueue = dispatch_queue_create( "com.megvii.sample.capturepipeline.recordercallback", DISPATCH_QUEUE_SERIAL );
            [self.movieRecorder setDelegate:self callbackQueue:callbackQueue];
            
#if RECORD_AUDIO
            [self.movieRecorder addAudioTrackWithSourceFormatDescription:self.outputAudioFormatDescription settings:_audioCompressionSettings];
#endif
            [self.movieRecorder prepareToRecord];
        }
        [self.movieRecorder appendVideoSampleBuffer:pixelBuffer];
    }
}

- (void)addVideo:(CMSampleBufferRef)sampleBuffer{
    @synchronized(self){
        if (!self.movieRecorder) {
            return;
        }
        [self.movieRecorder appendAudioSampleBuffer:sampleBuffer];
    }
}

//完成录像
- (void)stopVideoWriter{
    [self.movieRecorder finishRecording];
}

#pragma mark - delegate
-(void)onFrameDetected:(MGLivenessDetectionFrame *)frame andTimeout:(float) timeout{
    
}

-(void)onDetectionFailed:(MGLivenessDetectionFailedType)failedType{
    NSLog(@"failedType: %u", failedType);
    
    MAIN_ACTION(^(){
        [self initHardCodeWithCheckNO];
//        if ([self.navigationController.viewControllers.lastObject isKindOfClass:[self class]]) {
//            
            [self pushFinshVC:failedType checkOK:NO];
//        }
    });
}

- (MGLivenessDetectionType)onDetectionSuccess:(MGLivenessDetectionFrame *)faceInfo{
    
    _starLiveness = NO;
    MGLivenessDetectionType detectionType = [self randActionType];
    _curStep++;
    
    if (_curStep == 1) {
        detectionType = DETECTION_TYPE_DONE;
    }else{
        _starLiveness = YES;
    }
    
    MAIN_ACTION(^(){
        if (_curStep != 1) {
            [self starAnimation:detectionType];
        }else{
            _starLiveness = YES;
            
            [self pushFinshVC:DETECTION_FAILED_TYPE_ACTIONBLEND checkOK:YES];
        }
    });
    return detectionType;
}

- (void)pushFinshVC:(MGLivenessDetectionFailedType)type checkOK:(BOOL)check{
    [self stopVideoWriter];
    [DetectionPersonManager shareManager].photoArray = [self.livenessDetector getValidFrame];
    
    NSString* message;
    if(!check)
    {
    switch (type) {
        case DETECTION_FAILED_TYPE_ACTIONBLEND:
        {
             message = @"检测失败，请按照提示做出相应的动作";
            
        }
            break;
        case DETECTION_FAILED_TYPE_NOTVIDEO:
        {
             message = @"您的动作不符合规范，请重新按照提示做出相应的动作";
        }
            break;
        case DETECTION_FAILED_TYPE_TIMEOUT:
        {
             message = @"检测超时，请在规定时间内按照提示完成相应动作";
        }
            break;
        default:
            break;
    }
            NSDictionary*   d = [NSDictionary dictionaryWithObject:message                                                                      forKey:@"ok"];
        [[NSNotificationCenter defaultCenter] postNotificationName:@"verify" object:self userInfo:d];
         [self dismissViewControllerAnimated:true completion:nil];

    }else
    {
        BOOL finishCheck = [[DetectionPersonManager shareManager] finishCheck];
        if (finishCheck) {
            [self starMumWithTitle:@"对比中" topImage:nil];
            [[DetectionPersonManager shareManager] postImage:^(id XXX) {
               // [self stopMumWithAfterDelay:0.5f];
               
                NSDictionary *d ;
                if (XXX) {
                    BOOL isSamePerson = [[XXX valueForKey:@"is_same_person"] boolValue];
                    //CGFloat confidence = [[XXX valueForKey:@"confidence"] floatValue];
//                    [self.animationView startRollWith:isSamePerson];
                    
                    if (isSamePerson) {
//                        [self.nextBTN setTitle:@"继续认证" forState:UIControlStateNormal];
//                        [self.titleLabel setText:@"认证成功"];
//                        [self.messageLabel setText:@""];
//                        self.Result=@"success";
                       d = [NSDictionary dictionaryWithObject:@"success"
                                                                      forKey:@"ok"];
                        
                    }else{
                         NSString*  message =@"人脸验证失败，不是同一个人";
                        d = [NSDictionary dictionaryWithObject:message                                                                      forKey:@"ok"];
                    }
                }else{
                     NSString*  message =@"链接网络失败";
                    d = [NSDictionary dictionaryWithObject:message
                                                                  forKey:@"ok"];
                }
               [[NSNotificationCenter defaultCenter] postNotificationName:@"verify" object:self userInfo:d];
                [self dismissViewControllerAnimated:true completion:nil];

            }];
        }
    }

}

- (UIImage *) imageFromSampleBuffer:(CMSampleBufferRef) sampleBuffer orientation:(UIImageOrientation) orientation {
    CVImageBufferRef imageBuffer = CMSampleBufferGetImageBuffer(sampleBuffer);
    CVPixelBufferLockBaseAddress(imageBuffer, 0);
    
    void *baseAddress = CVPixelBufferGetBaseAddress(imageBuffer);
    
    size_t bytesPerRow = CVPixelBufferGetBytesPerRow(imageBuffer);
    size_t width = CVPixelBufferGetWidth(imageBuffer);
    size_t height = CVPixelBufferGetHeight(imageBuffer);
    
    CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
    CGContextRef context = CGBitmapContextCreate(baseAddress, width, height, 8,
                                                 bytesPerRow, colorSpace, kCGBitmapByteOrder32Little | kCGImageAlphaPremultipliedFirst);
    CGImageRef quartzImage = CGBitmapContextCreateImage(context);
    CVPixelBufferUnlockBaseAddress(imageBuffer,0);
    
    UIImage *image = [UIImage imageWithCGImage:quartzImage scale:1.0 orientation:orientation];
    
    CGImageRelease(quartzImage);
    CGContextRelease(context);
    CGColorSpaceRelease(colorSpace);
    
    return image;
}

- (CGAffineTransform)transformFromVideoBufferOrientationToOrientation:(AVCaptureVideoOrientation)orientation withAutoMirroring:(BOOL)mirror
{
    CGAffineTransform transform = CGAffineTransformIdentity;
    
    CGFloat orientationAngleOffset = angleOffsetFromPortraitOrientationToOrientation( orientation );
    CGFloat videoOrientationAngleOffset = angleOffsetFromPortraitOrientationToOrientation( self.videoOrientation );
    
    CGFloat angleOffset = orientationAngleOffset - videoOrientationAngleOffset;
    transform = CGAffineTransformMakeRotation(angleOffset);
    
    //    if (_videoDevice.position == AVCaptureDevicePositionFront )
    //    {
    //        if ( mirror ) {
    //            transform = CGAffineTransformScale( transform, -1, 1 );
    //        }
    //        else {
    ////            if (UIInterfaceOrientationIsPortrait(orientation ) ) {
    transform = CGAffineTransformRotate(transform, -M_PI);
    //            }
    //        }
    //    }
    
    return transform;
}

static CGFloat angleOffsetFromPortraitOrientationToOrientation(AVCaptureVideoOrientation orientation)
{
    CGFloat angle = 0.0;
    
    switch ( orientation )
    {
        case AVCaptureVideoOrientationPortrait:
            angle = 0.0;
            break;
        case AVCaptureVideoOrientationPortraitUpsideDown:
            angle = M_PI;
            break;
        case AVCaptureVideoOrientationLandscapeRight:
            angle = -M_PI_2;
            break;
        case AVCaptureVideoOrientationLandscapeLeft:
            angle = M_PI_2;
            break;
        default:
            break;
    }
    return angle;
}

#pragma mark -
- (void)movieRecorder:(MovieRecorder *)recorder didFailWithError:(NSError *)error{
    NSLog(@"record error:%@", error);
}
- (void)movieRecorderDidFinishPreparing:(MovieRecorder *)recorder{
    NSLog(@"record Preparing");
    
}
-(void)movieRecorderDidFinishRecording:(MovieRecorder *)recorder{
    NSLog(@"Record finish");
}

@end
