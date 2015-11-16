//
//  AppDelegate+Action.h
//  KoalaPhoto
//
//  Created by 张英堂 on 15/2/7.
//  Copyright (c) 2015年 visionhacker. All rights reserved.
//

#import "AppDelegate.h"

@interface AppDelegate (Action)

/**
 *  更改windows root viewcontroller
 *
 *  @param vc     更改后的 vc
 *  @param fromVC 从那个页面更改
 */
+ (void)changeWindowsRootVC:(UIViewController *)vc andFromVC:(UIViewController *)fromVC;

@end
