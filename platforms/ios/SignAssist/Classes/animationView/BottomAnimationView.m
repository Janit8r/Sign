//
//  BottomAnimationView.m
//  LivenessDetection
//
//  Created by 张英堂 on 15/1/8.
//  Copyright (c) 2015年 megvii. All rights reserved.
//

#import "BottomAnimationView.h"
#import "YTMacro.h"
#import "CircularRing.h"
#import "ImhtPlayAudio.h"

@interface BottomAnimationView ()
{
   CGFloat _aniViewHeigh;
    BOOL _stopAnimaiton;
}
@property (nonatomic, strong) UIImageView *imageViewA;
@property (nonatomic, strong) UIImageView *imageViewB;
@property (nonatomic, assign) CGFloat cencerX;

@property (nonatomic, strong) UILabel *messageLabel;
@property (nonatomic, strong) CircularRing *rightRing;

@end

#define kTopDis 10

@implementation BottomAnimationView

- (instancetype)initWithFrame:(CGRect)frame{
    self = [super initWithFrame:frame];
    if (self) {
        
        self.imageViewA = [[UIImageView alloc] initWithFrame:CGRectZero];
        self.imageViewB = [[UIImageView alloc] initWithFrame:CGRectZero];
        
        _aniViewHeigh = self.frame.size.height/4*3;
        _cencerX = (WIN_WIDTH - _aniViewHeigh)*0.5;

        [self.imageViewB setFrame:CGRectMake(WIN_WIDTH, kTopDis, _aniViewHeigh, _aniViewHeigh)];
        
        [self addSubview:self.imageViewA];
        [self addSubview:self.imageViewB];
        
        self.rightRing = [[CircularRing alloc] initWithFrame:CGRectMake(WIN_WIDTH *0.8, 20, 50, 50)];
        [self addSubview:self.rightRing];
        
        self.messageLabel = [[UILabel alloc] initWithFrame:CGRectMake(0, kTopDis+_aniViewHeigh+10, WIN_WIDTH, 30)];
        [self.messageLabel setFont:[UIFont systemFontOfSize:24]];
        [self.messageLabel setTextColor:[UIColor whiteColor]];
        [self.messageLabel setTextAlignment:NSTextAlignmentCenter];
        
        [self addSubview:self.messageLabel];
        
        [self recovery];
    }
    return self;
}

- (void)recovery{
    
    _stopAnimaiton = YES;
    
    [self.rightRing stopAnimation];
    
    [self.imageViewA stopAnimating];
    self.imageViewA.animationImages = nil;

    CGRect sourceRect = CGRectMake(_cencerX, kTopDis, _aniViewHeigh, _aniViewHeigh);
    [self.imageViewA setImage:[UIImage imageNamed:@"header_first"]];
    [self.imageViewA setFrame:sourceRect];
    
    [self.messageLabel setText:@"请将正脸置于取景框内"];
}

- (void)willChangeAnimation:(MGLivenessDetectionType)state outTime:(CGFloat)time{
    [self.imageViewA stopAnimating];
    _stopAnimaiton = NO;
    
    NSMutableArray *array = [NSMutableArray arrayWithCapacity:2];
    NSString *title = nil;
    NSString *videoName = nil;
    [self outTime:time];
    
    switch (state) {
        case DETECTION_TYPE_BLINK:
        {
            [array addObject:[UIImage imageNamed:@"head-eye"]];
            [array addObject:[UIImage imageNamed:@"head-blink"]];
            title = @"眨眼";
            videoName = @"zhayan";
            break;
        }
        case DETECTION_TYPE_MOUTH:
        {
            [array addObject:[UIImage imageNamed:@"head-blink"]];
            [array addObject:[UIImage imageNamed:@"head-openMouse"]];
            title = @"张嘴";
            videoName = @"zhangzui";

            break;
        }
        case DETECTION_TYPE_POS_YAW:
        {
            [array addObject:[UIImage imageNamed:@"head-left"]];
            [array addObject:[UIImage imageNamed:@"head-right"]];
            title = @"左右转头";
            videoName = @"youzhuan";

            break;
        }
        case DETECTION_TYPE_POS_PITCH:
        {
            [array addObject:[UIImage imageNamed:@"head-up"]];
            [array addObject:[UIImage imageNamed:@"head-down"]];
            title = @"上下点头";
            videoName = @"dt";

            break;
        }
        case DETECTION_TYPE_DONE:
        {
            [array addObject:[UIImage imageNamed:@"head-blink"]];
            title = @"完成";

            break;
        }
        default:
            break;
    }
    [[ImhtPlayAudio sharedAudioPlayer] playWithFileName:videoName];
    
    if (array.count != 0) {
        CGRect sourceRect = CGRectMake(_cencerX, kTopDis, _aniViewHeigh, _aniViewHeigh);
        CGRect leftHideRect = CGRectMake(-_aniViewHeigh, kTopDis, _aniViewHeigh, _aniViewHeigh);
        CGRect rightHideRect = CGRectMake(WIN_WIDTH, kTopDis, _aniViewHeigh, _aniViewHeigh);
        self.messageLabel.text = title;

        self.imageViewB.image = array[0];
        [UIView animateWithDuration:0.2f
                         animations:^{
                             if (!_stopAnimaiton) {
                                 [self.imageViewA setFrame:leftHideRect];
                                 [self.imageViewB setFrame:sourceRect];
                             }else{
                                 [self.imageViewA setImage:[UIImage imageNamed:@"header_first"]];
                             }
                         }
                         completion:^(BOOL finished) {
                             if (!_stopAnimaiton) {
                                 self.imageViewA.image = self.imageViewB.image;
                                 
                                 [self.imageViewA setFrame:sourceRect];
                                 [self.imageViewB setFrame:rightHideRect];
                                 
                                 [self.imageViewA setAnimationImages:array];
                                 
                                 [self.imageViewA setAnimationRepeatCount:999];
                                 [self.imageViewA setAnimationDuration:1.5f];
                                 
                                 [self.imageViewA startAnimating];
                             
                             }else{
                                 self.imageViewA.animationImages = nil;
                                 
                                 [self.imageViewA setFrame:sourceRect];
                                 [self.imageViewB setFrame:rightHideRect];
                                 [self.imageViewA setImage:[UIImage imageNamed:@"header_first"]];
                             }
                         }];
    }
}

- (void)outTime:(CGFloat)time{
    
    [self.rightRing setMaxTime:time];
}

- (void)startRollAnimation{
    [self.rightRing startAnimation];
}
@end
