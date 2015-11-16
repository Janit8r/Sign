//
//  AppDelegate+Action.m
//  KoalaPhoto
//
//  Created by 张英堂 on 15/2/7.
//  Copyright (c) 2015年 visionhacker. All rights reserved.
//

#import "AppDelegate+Action.h"
#import "UIView+DrawLine.h"

@implementation AppDelegate (Action)

//更改root vc
+ (void)changeWindowsRootVC:(UIViewController *)vc andFromVC:(UIViewController *)fromVC{
    
    UIImage *image = [fromVC.view getImageFromView];
    UIImageView *imageView = [[UIImageView alloc] initWithImage:image];
    [vc.view addSubview:imageView];
    
    AppDelegate *delegate = (AppDelegate *)[[UIApplication sharedApplication] delegate];
    //修改rootViewController
    [delegate.window addSubview:vc.view];
    delegate.window.rootViewController = vc;
    
    [UIView animateWithDuration:0.3f animations:^{
        imageView.layer.transform = CATransform3DMakeScale(1.3, 1.3, 1.3);
        imageView.alpha = 0.1;
        
    } completion:^(BOOL finished) {
        [imageView removeFromSuperview];
    }];
}
@end
