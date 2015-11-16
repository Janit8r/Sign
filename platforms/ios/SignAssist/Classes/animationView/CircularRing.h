//
//  CircularRing.h
//  LivenessDetection
//
//  Created by 张英堂 on 15/1/13.
//  Copyright (c) 2015年 megvii. All rights reserved.
//

#import <UIKit/UIKit.h>


/**
 *  每一步 倒计时
 */
@interface CircularRing : UIView
{
    CGFloat _maxTime;
    NSInteger _count;
}

/**
 *  请忽略 该界面东西
 */
@property (nonatomic) CAShapeLayer *circleLayer;
@property (nonatomic, strong) UIImageView *bottomView;
@property (nonatomic, strong) UILabel *numLabel;

@property (nonatomic, strong) NSTimer *timer;



/**
 *  设置旋转时间
 *
 *  @param time 时间
 */
- (void)setMaxTime:(CGFloat)time;

/**
 *  开启动画
 */
- (void)startAnimation;

/**
 *  关闭动画
 */
- (void)stopAnimation;


@end
