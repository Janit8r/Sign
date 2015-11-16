//
//  CountZero.m
//  LivenessDetection
//
//  Created by 张英堂 on 15/1/8.
//  Copyright (c) 2015年 megvii. All rights reserved.
//

#import "CountZeroManager.h"
#import "YTAlertView.h"
#import "YTMacro.h"

#define kCountDownNum 2

@interface CountZeroManager ()
{
    NSInteger _count;
}
@property (nonatomic, strong) UIImageView *imageView;
@property (nonatomic, strong) UIImageView *bottomImageView;
@property (nonatomic, strong) UILabel *textLabel;
@property (nonatomic, strong) UIView *mainView;

@property (nonatomic, strong) YTAlertView *alertView;
@property (nonatomic, strong) NSTimer *timer;

@end

static CountZeroManager *manager;

@implementation CountZeroManager

- (void)dealloc{
    _timer = nil;
    _alertView = nil;
    _alertView = nil;
}

- (instancetype)init{
    self = [super init];
    if (self) {
        
        self.mainView = [[UIView alloc] initWithFrame:CGRectMake(0, 0, WIN_WIDTH/3, WIN_WIDTH/3)];
        
        self.imageView = [[UIImageView alloc] initWithFrame:CGRectMake(10, 10, WIN_WIDTH/3-20, WIN_WIDTH/3-20)];
        [self.imageView setBackgroundColor:[UIColor clearColor]];
        [self.imageView setImage:[UIImage imageNamed:@"main_start_timeout"]];

        self.bottomImageView = [[UIImageView alloc] initWithFrame:CGRectMake(0, 0, WIN_WIDTH/3, WIN_WIDTH/3)];
        [self.bottomImageView setBackgroundColor:[UIColor clearColor]];
        [self.bottomImageView setImage:[UIImage imageNamed:@"main_circle"]];
        
        self.textLabel = [[UILabel alloc] initWithFrame:self.mainView.bounds];
        [self.textLabel setText:@"3"];
        [self.textLabel setTextAlignment:NSTextAlignmentCenter];
        [self.textLabel setFont:[UIFont systemFontOfSize:WIN_WIDTH / 6]];
        [self.textLabel setTextColor:[UIColor whiteColor]];
        
        [self.mainView addSubview:self.bottomImageView];
        [self.mainView addSubview:self.imageView];
        [self.mainView addSubview:self.textLabel];

        self.alertView = [[YTAlertView alloc] initWithSourceView:self.mainView frameOfsView:CGRectMake(WIN_WIDTH / 3, (WIN_HEIGHT - (WIN_WIDTH/3))/2,  WIN_WIDTH / 3,  WIN_WIDTH / 3)];
        [self.alertView closeGestHide];

        _count = 0;
    }
    return self;
}

- (void)starOpen{
    if (self.timer == nil) {
        self.timer = [NSTimer timerWithTimeInterval:1 target:self selector:@selector(timeChange) userInfo:nil repeats:YES];
        [[NSRunLoop currentRunLoop] addTimer:self.timer forMode:NSDefaultRunLoopMode];
    }
    [self bottomRollAnimation];
    [self.alertView showWithAnimation:YES];
    
    [self.timer fire];
}

- (void)timeChange{
    
    NSInteger num = kCountDownNum - _count+1;
    
    [self.textLabel setText:[NSString stringWithFormat:@"%ld", (long)num]];
    
    if (_count == kCountDownNum) {
        [self.alertView hideWithAnimation:NO];
        [self.bottomImageView.layer removeAllAnimations];

        [self.timer invalidate];
        self.timer = nil;
    }

    _count ++;
}

- (void)bottomRollAnimation{
    
    CABasicAnimation* rotationAnimation;
    rotationAnimation = [CABasicAnimation animationWithKeyPath:@"transform.rotation.z"];
    rotationAnimation.toValue = [NSNumber numberWithFloat: M_PI * 2.0];
    rotationAnimation.duration = 1.0f;
    rotationAnimation.cumulative = YES;
    rotationAnimation.repeatCount = 10;
    
    [self.bottomImageView.layer addAnimation:rotationAnimation forKey:@"rotationAnimation"];
}


@end




