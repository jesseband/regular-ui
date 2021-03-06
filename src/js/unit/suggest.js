/**
 * ------------------------------------------------------------
 * Suggest   自动提示
 * @author   sensen(rainforest92@126.com)
 * ------------------------------------------------------------
 */

'use strict';

var Dropdown = require('./dropdown.js');
var template = require('text!./suggest.html');
var _ = require('regular-ui-base/src/_');

/**
 * @class Suggest
 * @extend Dropdown
 * @param {object}                  options.data                     =  绑定属性
 * @param {object[]=[]}             options.data.source             <=> 数据源
 * @param {string}                  options.data.source[].name       => 每项的内容
 * @param {object=null}             options.data.selected           <=> 当前选择项
 * @param {string=''}               options.data.value              <=> 文本框中的值
 * @param {string='请输入'}         options.data.placeholder         => 文本框的占位文字
 * @param {number}                  options.data.maxlength           => 文本框的最大长度
 * @param {number=0}                options.data.startLength         => 开始提示长度。当输入长度>=该值后开始提示
 * @param {string='all'}            options.data.matchType           => 匹配方式，`all`表示匹配全局，`start`表示只匹配开头，`end`表示只匹配结尾
 * @param {boolean=false}           options.data.strict              => 是否为严格模式。当为严格模式时，`value`属性必须在source中选择，否则为空。
 * @param {boolean=false}           options.data.autofocus           => 是否自动获得焦点
 * @param {boolean=false}           options.data.readonly            => 是否只读
 * @param {boolean=false}           options.data.disabled            => 是否禁用
 * @param {boolean=true}            options.data.visible             => 是否显示
 * @param {string=''}               options.data.class               => 补充class
 * @param {object}                  options.service                 @=> 数据服务
 */
var Suggest = Dropdown.extend({
    name: 'suggest',
    template: template,
    /**
     * @protected
     */
    config: function() {
        _.extend(this.data, {
            // @inherited source: [],
            // @inherited open: false,
            selected: null,
            value: '',
            placeholder: '请输入',
            maxlength: undefined,
            startLength: 0,
            delay: 300,
            matchType: 'all',
            strict: false,
            autofocus: false
        });
        this.supr();
    },
    /**
     * @method select(item) 选择某一项
     * @public
     * @param  {object} item 选择项
     * @return {void}
     */
    select: function(item) {
        this.$update('selected', item);
        this.data.value = item.name;
        //this.data.selected = item;
        /**
         * @event select 选择某一项时触发
         * @property {object} selected 当前选择项
         */
        this.$emit('select', {
            selected: item
        });
        this.toggle(false);
    },
    /**
     * @method toggle(open)  在展开状态和收起状态之间切换
     * @public
     * @param  {boolean} open 展开还是收起
     * @return {void}
     */
    toggle: function(open, _isInput) {
        if(this.data.readonly || this.data.disabled)
            return;

        this.data.open = open;

        /**
         * @event toggle 展开或收起状态改变时触发
         * @property {boolean} open 展开还是收起
         */
        this.$emit('toggle', {
            open: open
        });

        var index = Dropdown.opens.indexOf(this);
        if(open && index < 0)
            Dropdown.opens.push(this);
        else if(!open && index >= 0) {
            Dropdown.opens.splice(index, 1);

            if(!_isInput && this.data.strict)
               this.data.value = this.data.selected ? this.data.selected.name : '';
        }
    },
    /**
     * @private
     */
    input: function($event) {
        var value = this.data.value;

        if(value.length >= this.data.startLength) {
            this.toggle(true);
            if(this.service)
                this.$updateSource();
        } else
            this.toggle(false, true);
    },
    /**
     * @private
     */
    uninput: function($event) {

    },
    /**
     * @private
     */
    getParams: function() {
        return {value: this.data.value};
    },
    /**
     * @private
     */
    filter: function(item) {
        var value = this.data.value;

        if(!value && this.data.startLength)
            return false;

        if(this.data.matchType === 'all')
            return item.name.indexOf(value) >= 0;
        else if(this.data.matchType === 'startLength')
            return item.name.slice(0, value.length) === value;
        else if(this.data.matchType === 'end')
            return item.name.slice(-value.length) === value;
    }
});

module.exports = Suggest;