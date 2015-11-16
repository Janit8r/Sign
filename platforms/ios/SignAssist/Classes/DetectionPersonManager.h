//
//  DetectionPersonManager.h
//  LivenessDetection
//
//  Created by 张英堂 on 15/1/26.
//  Copyright (c) 2015年 megvii. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "YTMacro.h"


@interface DetectionPersonManager : NSObject

@property (nonatomic, copy) NSString *userId;
@property (nonatomic, copy) NSString *hostAPI;
@property (nonatomic, copy) NSString *api_key;
@property (nonatomic, copy) NSString *api_secret;

@property (nonatomic, strong) NSMutableArray *photoArray; //活体完成后，要上传的图片数组

@property (nonatomic, assign) BOOL finishCheck; //活体完成是否 上传比较
@property (nonatomic, assign) BOOL ldDebug;     //debug模式，录像
@property (nonatomic, assign) BOOL showImages;  //活体完成显示 照片
@property (nonatomic, assign) BOOL showLike;    //图片对比完成显示 相似度


+ (instancetype)shareManager;

//获取存储 录像的名字 -- 保证每次生成的名字都不相同
- (NSString *)getSaveMovieName;

//上传图片比对 -- 活体完成后进行
- (void)postImage:(VoidBlock_id)finsh;

//注册用户
- (void)registerPerson:(UIImage *)personImage  username:(NSString *)name finsh:(VoidBlock_id)finsh;
- (void)searchPerson:(NSString *)name finsh:(VoidBlock_id)finsh;
//对图片抽featrue
- (void)featureWithImage:(UIImage *)image finsh:(VoidBlock_id)finsh;

//两张图片对比， [Feature1, Feature2]
- (void)compareWithFaceArray:(NSArray *)faceArray finsh:(VoidBlock_id)finsh;

//检查身份证
- (void)checkUserCard:(UIImage *)image finish:(VoidBlock_id)finish;

//清理活体保存下的照片数组
- (void)removeAllPhoto;


- (void)getAllUser;

- (BOOL)setApi_key:(NSString *)api_key apiSelect:(NSString *)select;


@end
