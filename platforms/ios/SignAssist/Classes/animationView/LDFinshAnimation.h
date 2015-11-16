//
//  AnimationView.h
//  LivenessDetection
//
//  Created by 张英堂 on 15/1/7.
//  Copyright (c) 2015年 megvii. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "YTMacro.h"

/**
 *  完成活体检测，最后显示页面的 动画
 */

@interface LDFinshAnimation : UIView


/**
 *  动画完成回调
 */
@property (nonatomic, copy) VoidBlock animationFinish;


/**
 *  开启动画
 *
 *  @param ture
 */
- (void)startRollWith:(BOOL)ture;


@end

