//
//  BottomAnimationView.h
//  LivenessDetection
//
//  Created by 张英堂 on 15/1/8.
//  Copyright (c) 2015年 megvii. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "LivenessEnumType.h"


/**
 *  显示该步骤要操作的动画
 */
@interface BottomAnimationView : UIView

/**
 *  下一步 显示的动画
 *
 *  @param state 动画类型
 *  @param time  倒计时间
 */
- (void)willChangeAnimation:(MGLivenessDetectionType)state outTime:(CGFloat)time;

/**
 *  倒计时间
 *
 *  @param time 时间
 */
- (void)outTime:(CGFloat)time;

/**
 *  开始动画
 */
- (void)startRollAnimation;

/**
 *  恢复初始状态
 */
- (void)recovery;

@end
