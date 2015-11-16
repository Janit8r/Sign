//
//  LDRegisterVC.m
//  LivenessDetection
//
//  Created by 张英堂 on 15/6/10.
//  Copyright (c) 2015年 megvii. All rights reserved.
//

#import "LDRegisterVC.h"
#import "YTGetPhoto.h"
#import "UIImage+Resize.h"
#import "DetectionPersonManager.h"
#import "UIView+convenience.h"
#import "NSDate+convenience.h"

@interface LDRegisterVC ()<UIAlertViewDelegate>

@property (nonatomic, strong) YTGetPhoto *getPhoto;
@property (weak, nonatomic) IBOutlet UIImageView *imageView;
@property (weak, nonatomic) IBOutlet UITextField *nameTextFiedl;

@end

@implementation LDRegisterVC
@synthesize Name;
-(void)dealloc{
    [[NSNotificationCenter defaultCenter] removeObserver:self name:kPhotoFinshObserver object:nil];
}

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(takeFinish:) name:kPhotoFinshObserver object:nil];
    [self.imageView setClipsToBounds:YES];
    [self.nameTextFiedl setFrameHeight:40];
    
}
- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

//注册用户，如果没有输入用户名，则自动生成，根据时间戳
- (IBAction)registerPersonAction:(id)sender {
    if (!self.imageView.image) {
        return;
    }
    
    [self registerPerson:self.imageView.image];
}

- (IBAction)addPhoto:(id)sender {
    if (!self.getPhoto) {
        self.getPhoto = [[YTGetPhoto alloc] initWithViewController:self andError:nil];
    }
    [self.getPhoto openMenu];
}

- (IBAction)backAction:(id)sender {
    self.getPhoto = nil;
    [self dismissViewControllerAnimated:YES completion:nil];
}

#pragma mark -
//接受到图片，并且裁剪
- (void)takeFinish:(NSNotification *)notifi{
    UIImage *image = [[notifi userInfo] valueForKey:kPhotoFinshImage];
    UIImage *scalImage = image;
    if (!image)
        return;
    CGFloat maxW = image.size.height > image.size.width ? image.size.height : image.size.width;
    CGFloat scalNum = 1;
    if (maxW > 1000) {
        scalNum = maxW / 900;
    }
    if (scalNum != 1) {
        scalImage = [image resizedImage:CGSizeMake(image.size.width / scalNum, image.size.height / scalNum)
                   interpolationQuality:kCGInterpolationDefault];
    }
    
    self.imageView.image = scalImage;
}

//显示照片，并且注册
- (void)registerPerson:(UIImage *)image{
    
    __weak LDRegisterVC *weakSelf = self;
    [self starMumWithTitle:@"正在检测人脸，请稍等" topImage:nil];
    //    NSString *userName = self.nameTextFiedl.text;
    //    if (userName.length == 0){
    //        NSString *dateString = [[NSDate date] stringForTimesTampWithS];
    //        userName = [NSString stringWithFormat:@"iOS_%@", dateString];
    //    }
    
    [[DetectionPersonManager shareManager] registerPerson:image username:self.Name finsh:^(id xxx) {
        [weakSelf stopMumWithAfterDelay:0.1];
        
        if ([xxx isKindOfClass:[ NSError class]] ==false) {
            NSString *personName = [xxx valueForKey:@"person_name"];
            [[DetectionPersonManager shareManager] setUserId:personName];
            //
            NSData * imagedata=UIImagePNGRepresentation(image);
            
            NSArray* paths=NSSearchPathForDirectoriesInDomains(NSDocumentDirectory,NSUserDomainMask,YES);
            NSString *documentsDirectory=[paths objectAtIndex:0];
            
            
            NSString *savedImagePath=[documentsDirectory stringByAppendingFormat:@"/%@.png",personName];
            
            [imagedata writeToFile:savedImagePath atomically:YES];
            NSMutableDictionary *d = [NSMutableDictionary dictionaryWithObject:savedImagePath
                                                          forKey:@"image"];
            [d setValue:@"success" forKey:@"result"];
            [[NSNotificationCenter defaultCenter] postNotificationName:@"register" object:self userInfo:d];
            [self dismissViewControllerAnimated:TRUE completion:nil];

            //
        }else{
            NSError* error = (NSError*)xxx;
            NSString* desc = error.localizedDescription;
            NSDictionary *d = [NSDictionary dictionaryWithObject:desc
                                                          forKey:@"result"];
            [[NSNotificationCenter defaultCenter] postNotificationName:@"register" object:self userInfo:d];

            [self dismissViewControllerAnimated:TRUE completion:nil];
        }
    }];
}

#pragma mark -
- (void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex{
    if (alertView.tag == 99) {
        //        self.imageView.image = nil;
    }else{
        if (buttonIndex == 0) {
            
        }else{
            [self dismissViewControllerAnimated:YES completion:nil];
        }
    }
}

/*
 #pragma mark - Navigation
 
 // In a storyboard-based application, you will often want to do a little preparation before navigation
 - (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
 // Get the new view controller using [segue destinationViewController].
 // Pass the selected object to the new view controller.
 }
 */

@end
