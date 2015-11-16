//
//  TakePhotoVC.h
//  KoalaPhoto
//
//  Created by 张英堂 on 14/11/13.
//  Copyright (c) 2014年 visionhacker. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "BaseViewController.h"
#import "LivenessEnumType.h"


/**
 *  活体检测页面
 */

@interface LDVideoViewController: BaseViewController

//是否保存活体时 的录像
@property (nonatomic, assign) BOOL shouldMovie;


@end
