package com.hyg.ble;

import java.util.List;

import org.apache.cordova.*;
import org.json.JSONArray;
import org.json.JSONException;

import com.neovisionaries.bluetooth.ble.advertising.ADPayloadParser;
import com.neovisionaries.bluetooth.ble.advertising.ADStructure;
import com.neovisionaries.bluetooth.ble.advertising.LocalName;
import android.annotation.SuppressLint;
import android.annotation.TargetApi;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Handler;

import com.baidu.location.BDLocation;
import com.baidu.location.BDLocationListener;
import com.baidu.location.LocationClient;
import com.baidu.location.LocationClientOption;
import com.baidu.location.LocationClientOption.LocationMode;

public class Ble extends CordovaPlugin {

	@SuppressLint("NewApi")
	private BluetoothAdapter.LeScanCallback mLeScanCallback = new BluetoothAdapter.LeScanCallback() {
		@Override
		public void onLeScan(final BluetoothDevice device, int rssi, byte[] scanRecord) {
			List<ADStructure> structures = ADPayloadParser.getInstance().parse(scanRecord);
			for (int i = 0; i < structures.size(); i++) {
				if (structures.get(i).getType() == 9) {
					LocalName name = (LocalName) structures.get(i);
					if (name.getLocalName().equals(_name)) {
						mHandler.removeCallbacks(r);
						PluginResult rr = new PluginResult(PluginResult.Status.OK,
								"{\"result\":\"success\",\"type\":\"blue\"}");
						rr.setKeepCallback(true);
						mBluetoothAdapter.stopLeScan(this);
						_context.sendPluginResult(rr);
					}
				}
			}

		}
	};
	private BluetoothAdapter mBluetoothAdapter;
	private boolean mScanning;
	private Handler mHandler = new Handler();
	private String _name = null;
	private CallbackContext _context;
	Runnable r = new Runnable() {
		@TargetApi(Build.VERSION_CODES.JELLY_BEAN_MR2)
		@SuppressWarnings("deprecation")
		@Override
		public void run() {
			mScanning = false;
			mBluetoothAdapter.stopLeScan(mLeScanCallback);
			PluginResult r = new PluginResult(PluginResult.Status.OK, "{\"result\":\"false\",\"type\":\"blue\"}");
			r.setKeepCallback(true);

			_context.sendPluginResult(r);
		}
	};
	public LocationClient mLocationClient = null;
	
	
	private void initLocation() {
		LocationClientOption option = new LocationClientOption();
		option.setLocationMode(LocationMode.Hight_Accuracy);// 可选，默认高精度，设置定位模式，高精度，低功耗，仅设备
		option.setCoorType("bd09ll");// 可选，默认gcj02，设置返回的定位结果坐标系

		option.setOpenGps(true);// 可选，默认false,设置是否使用gps

		mLocationClient.setLocOption(option);
	}

	@TargetApi(Build.VERSION_CODES.JELLY_BEAN_MR2)
	@Override
	public boolean execute(String action, JSONArray data, CallbackContext callbackContext) throws JSONException {
		_context = callbackContext;
		if (action.equals("scanGps")) {
			mLocationClient = new LocationClient(cordova.getActivity().getApplicationContext()); // 声明LocationClient类
			mLocationClient.registerLocationListener(new  BDLocationListener (){

				@Override
				public void onReceiveLocation(BDLocation location) {
					// Receive Location
					switch (location.getLocType()) {
					case BDLocation.TypeGpsLocation:
					case BDLocation.TypeNetWorkLocation:
					case BDLocation.TypeOffLineLocation:
						mLocationClient.stop();
						PluginResult r = new PluginResult(PluginResult.Status.OK,
								"{\"result\":\"success\",\"type\":\"gps\",\"lng\":\"" + location.getLongitude()
										+ "\",\"lat\":\"" + location.getLatitude() + "\"}");
						r.setKeepCallback(true);
						_context.sendPluginResult(r);
						break;
					case BDLocation.TypeServerError:
					case BDLocation.TypeNetWorkException:
					case BDLocation.TypeCriteriaException:

						PluginResult rr = new PluginResult(PluginResult.Status.OK, "{\"result\":\"fail\",\"type\":\"gps\"}");
						rr.setKeepCallback(true);
						_context.sendPluginResult(rr);

						break;
					default:
						break;
					}
				}
			});
			initLocation();
			mLocationClient.start();
		}
		if (action.equals("supportBle")) {
			PackageManager pm = cordova.getActivity().getApplicationContext().getPackageManager();
			boolean hasBLE = pm.hasSystemFeature(PackageManager.FEATURE_BLUETOOTH_LE);
			if (hasBLE) {
				PluginResult rr = new PluginResult(PluginResult.Status.OK, "{\"result\":\"ble\"}");
				rr.setKeepCallback(true);
				_context.sendPluginResult(rr);
			} else {
				PluginResult rr = new PluginResult(PluginResult.Status.OK, "{\"result\":\"gps\"}");
				rr.setKeepCallback(true);
				_context.sendPluginResult(rr);
			}

		}
		if (action.equals("exit")) {
			System.exit(0);
		}
		if (action.equals("scanBlue")) {

			_name = data.getString(0);
			//
			mScanning = true;
			// 蓝牙定位
			if (cordova.getActivity().getPackageManager().hasSystemFeature(PackageManager.FEATURE_BLUETOOTH_LE)) {
				//
				BluetoothManager bluetoothManager = (BluetoothManager) cordova.getActivity()
						.getSystemService(Context.BLUETOOTH_SERVICE);
				mBluetoothAdapter = bluetoothManager.getAdapter();

				if (mBluetoothAdapter != null) {
					if (mBluetoothAdapter.isEnabled() == false) {
						PluginResult rr = new PluginResult(PluginResult.Status.OK,
								"{\"result\":\"fail\",\"type\":\"blue\"}");
						rr.setKeepCallback(true);
						_context.sendPluginResult(rr);
						Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
						cordova.getActivity().startActivityForResult(enableBtIntent, 2);
					
					} else {
						mHandler.postDelayed(r, 10000);
						mBluetoothAdapter.startLeScan(mLeScanCallback);
					}
				} else {
					PluginResult rr = new PluginResult(PluginResult.Status.OK,
							"{\"result\":\"fail\",\"type\":\"blue\"}");
					rr.setKeepCallback(true);
					_context.sendPluginResult(rr);
				}
				//
			} else {
				PluginResult rr = new PluginResult(PluginResult.Status.OK, "{\"result\":\"fail\",\"type:\"blue\"}");
				rr.setKeepCallback(true);
				_context.sendPluginResult(rr);
			}
			return true;

		} else {
			return false;
		}
	}
}
