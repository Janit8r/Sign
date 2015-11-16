//
//  TYtMacro.h
//

#ifndef text_TYtMacro_h
#define text_TYtMacro_h

    #import "AFNetworking.h"
//    #import "UIImageView+WebCache.h"
    #import "AppDelegate.h"
//    #import "MyNotification.h"

//    //动画
//    #import "ImhtAnimation.h"
//    //类目
    #import "UIView+DrawLine.h"
    #import "UIColor+Mycolor.h"
    #import "UIView+Shadow.h"
    #import "FileManage.h"
//    #import "MJRefresh.h"

//    #import "BaseCell.h"
//    #import "BaseModel.h"
//    #import "MCFireworksButton.h"
//    #import "MobClick.h"

    //屏幕宽度 （区别于viewcontroller.view.fream）
    #define WIN_WIDTH  [UIScreen mainScreen].bounds.size.width
    //屏幕高度 （区别于viewcontroller.view.fream）
    #define WIN_HEIGHT [UIScreen mainScreen].bounds.size.height

    //输出测试使用
    #ifdef DEBUG
    #   define YTLog(XXX) NSLog(@"%@: %@", NSStringFromClass([self class]), XXX)
    #else
    #   define YTLog()
    #endif

    #if __LP64__ || (TARGET_OS_EMBEDDED && !TARGET_OS_IPHONE) || TARGET_OS_WIN32 || NS_BUILD_32_LIKE_64
    #   define YTIntLog(XXX) NSLog(@"%@: %ld", NSStringFromClass([self class]), XXX)
    #else
    #   define YTIntLog(XXX) NSLog(@"%@: %d", NSStringFromClass([self class]), XXX)
    #endif



    //IOS版本
    #define IOS_SysVersion [[UIDevice currentDevice] systemVersion].floatValue
    #define KDocumentFile NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES)[0]

    #define NavigationBarHight 64

//----------------------颜色类---------------------------
    // rgb颜色转换（16进制->10进制）
    #define UIColorFromRGB(rgbValue) [UIColor colorWithRed:((float)((rgbValue & 0xFF0000) >> 16))/255.0 green:((float)((rgbValue & 0xFF00) >> 8))/255.0 blue:((float)(rgbValue & 0xFF))/255.0 alpha:1.0]
    // color
    #define YT_ColorWithRGB(R, G, B, A) [UIColor colorWithRed:R/255.0f green:G/255.0f blue:B/255.0f alpha:A]

    //G－C－D
    #define BACK_ACTION(block) dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), block)
    #define MAIN_ACTION(block) dispatch_async(dispatch_get_main_queue(),block)

    //NSUserDefaults 实例化
    #define KUSER_DEFAULT [NSUserDefaults standardUserDefaults]

    //block 宏
    typedef void(^VoidBlock)();
    typedef BOOL(^BoolBlock)();
    typedef int (^IntBlock) ();
    typedef id  (^IDBlock)  ();

    typedef void(^VoidBlock_int)(NSUInteger);
    typedef BOOL(^BoolBlock_int)(int);
    typedef int (^IntBlock_int) (int);
    typedef id  (^IDBlock_int)  (int);

    typedef void(^VoidBlock_string)(NSString*);
    typedef BOOL(^BoolBlock_string)(NSString*);
    typedef int (^IntBlock_string) (NSString*);
    typedef id  (^IDBlock_string)  (NSString*);

    typedef void(^VoidBlock_id)(id);
    typedef BOOL(^BoolBlock_id)(id);
    typedef int (^IntBlock_id) (id);
    typedef id  (^IDBlock_id)  (id);

    typedef void(^VoidBlock_bool)(BOOL);


#endif
