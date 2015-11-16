//
//  AnimationView.m
//  LivenessDetection
//
//  Created by 张英堂 on 15/1/7.
//  Copyright (c) 2015年 megvii. All rights reserved.
//

#import "LDFinshAnimation.h"
#import "YTMacro.h"

static NSString *const firstAnimationKey = @"strokeEnd"; //第一步完成动画的名字

@interface LDFinshAnimation ()

@property (nonatomic) CAShapeLayer *circleLayer;
@property (nonatomic, strong) UIImageView *tureView;

@end

@implementation LDFinshAnimation

/*
// Only override drawRect: if you perform custom drawing.
// An empty implementation adversely affects performance during animation.
- (void)drawRect:(CGRect)rect {
    // Drawing code
}
*/

- (void)awakeFromNib {
    // Initialization code
//    CGRect frame = self.frame;
//    NSAssert(frame.size.width == frame.size.height, @"A circle must have the same height and width.");
    self.backgroundColor = [UIColor clearColor];
    
    [self addCircleLayer];
    
    [self setStrokeValue:0.0];
}

#pragma mark - Private Instance methods
- (void)addCircleLayer
{
    CGFloat lineWidth = 3.f;
    CGFloat radius = CGRectGetWidth(self.bounds)/2 - lineWidth/2;
    self.circleLayer = [CAShapeLayer layer];
    CGRect rect = CGRectMake(lineWidth/2, lineWidth/2, radius * 2, radius * 2);
    self.circleLayer.path = [UIBezierPath bezierPathWithRoundedRect:rect
                                                       cornerRadius:radius].CGPath;
    
    self.circleLayer.strokeColor = [UIColor ytColorWithRed:33 green:191 blue:181 alpha:1].CGColor;
    self.circleLayer.fillColor = [UIColor clearColor].CGColor;
    self.circleLayer.lineWidth = lineWidth;
    self.circleLayer.lineCap = kCALineCapRound;
    self.circleLayer.lineJoin = kCALineJoinRound;
    
    [self.layer addSublayer:self.circleLayer];
    self.tureView = [[UIImageView alloc] initWithFrame:self.bounds];
    [self.tureView drawRoundBoderWidth:5 andColor:[UIColor clearColor] andRadius:self.frame.size.width/2];
    [self.tureView setClipsToBounds:YES];
    self.tureView.layer.transform = CATransform3DMakeScale(0.1, 0.1, 0.1);
}

- (void)setStrokeValue:(CGFloat)value{
    
    self.circleLayer.strokeEnd = value;
}

- (void)startRollWith:(BOOL)ture{
    
    self.circleLayer.strokeEnd = 0.0f;
    NSString *imageName = nil;
    
    if (ture) {
        self.circleLayer.strokeColor = [UIColor ytColorWithRed:66 green:224 blue:184 alpha:1].CGColor;
        imageName = @"icon-ture";
    }else{
        self.circleLayer.strokeColor = [UIColor ytColorWithRed:251 green:118 blue:128 alpha:1].CGColor;
        imageName = @"icon-error";
    }
    
    [self.tureView setImage:[UIImage imageNamed:imageName]];
    
    self.circleLayer.strokeEnd = 1.0f;
    
    CABasicAnimation *drawAnimation = [CABasicAnimation animationWithKeyPath:firstAnimationKey];
    drawAnimation.duration            = 0.5f;
    drawAnimation.repeatCount         = 1.0;
    drawAnimation.removedOnCompletion = YES;
    drawAnimation.fromValue = [NSNumber numberWithFloat:0.0f];
    drawAnimation.toValue   = [NSNumber numberWithFloat:1.0f];
    drawAnimation.timingFunction = [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseIn];
    drawAnimation.delegate = self;
    
    [self.circleLayer addAnimation:drawAnimation forKey:firstAnimationKey];
}


- (void)animationDidStop:(CAAnimation *)anim finished:(BOOL)flag{
    
    if (self.tureView.superview != self) {
        [self addSubview:self.tureView];
    }
    
    [UIView animateWithDuration:0.25
                     animations:^{
                         self.tureView.layer.transform = CATransform3DMakeScale(1.2, 1.2, 1.2);
                     }completion:^(BOOL finished) {
                         [UIView animateWithDuration:0.15
                                          animations:^{
                                              self.tureView.layer.transform = CATransform3DIdentity;
                                          }completion:^(BOOL finished) {
                                              if (self.animationFinish) {
                                                  self.animationFinish();
                                              }
                                          }];
                     }];
}




@end
