/*:
-------------------------------------------------------------------------------
@title Weapon Damage
@author Hime --> HimeWorks (http://himeworks.com)
@version 1.3
@date May 26, 2016
@filename HIME_WeaponDamage.js
@url http://himeworks.com/2016/02/weapon-damage/

If you enjoy my work, consider supporting me on Patreon!

* https://www.patreon.com/himeworks

If you have any questions or concerns, you can contact me at any of
the following sites:

* Main Website: http://himeworks.com
* Facebook: https://www.facebook.com/himeworkscom/
* Twitter: https://twitter.com/HimeWorks
* Youtube: https://www.youtube.com/c/HimeWorks
* Tumblr: http://himeworks.tumblr.com/

-------------------------------------------------------------------------------
@plugindesc v1.3 - Define weapon damage formulas and separate them from
skill damage formulas.
@help 
-------------------------------------------------------------------------------
== Description ==

In RPG Maker, weapons can be equipped to actors.
You can also equip them to enemies if you use plugins like Enemy Equips.

Weapons can provide parameter bonuses like extra atk and agi, but you can't
specify a damage value for the weapons themselves.

For example, if you wanted to have the normal attack skill's damage value to
be equal to the amount of damage dealt by the weapon, you would be unable to
say this directly.

You could say that the "atk" bonus from the weapon represents how much damage
the weapon can do, but if you were to reference the actor's atk, you would be
including any additional atk bonuses that aren't part of the weapon.

This plugin allows you to define weapon damage formulas, which can be used
in your skill formulas if necessary.

By separating the weapon damage from your atk, you have more control over
how your want your skills to be set up!

== Terms of Use ==

- Free for use in non-commercial projects with credits
- Free for use in commercial projects, but it would be nice to let me know
- Please provide credits to HimeWorks

== Change Log ==

1.2 - Mar 28, 2016
 * Fixed bug where bare-handed weapon damage wasn't working
1.1 - Feb 7, 2016
 * added formula variable "a" for attacker
1.0 - Feb 6, 2016
 - initial release

== Usage ==

To define a damage formula for you weapons, note-tag them with

  <weapon damage>
    FORMULA
  </weapon damage>
  
For example, let's say you wanted your weapon's damage to be between 2 and 16.
You could write

  2 * (Math.randomInt(8) + 1)
  
Note that we add 1 because randomInt picks a number between 0 and the value
you provided.

For those that are familiar, this is equivalent to 2d8.
So if you wanted to write something like 1d6 + 4, you would write
  
  (1 * (Math.randomInt(6) + 1)) + 4

For now, weapon damages are assumed to be simple.
  
  -- Using Weapon Damage --
  
Weapon damage formulas are not automatically included in your skill damage
calculations, because you may not want to consider the weapon.

For example, if you're casting a spell and you're holding a sword, would you
include the sword damage in the spell damage? Maybe, maybe not.

To use the weapon damage formula, in your skill formula, you can write

  a.weaponDamage(b)
  
Which will return how much damage the attacker's weapons dealt, based on the
formula that you defined earlier. This value includes all weapons, so if the
attacker is holding two weapons or three weapons or more, they will all be
included in this total, which you can then use as part of the skill.

So let's say your normal attack was equal to your weapon's damage.
You would write

  a.weaponDamage(b)
  
But let's say you wanted to add a bonus for having extra "atk" power, which
could represent your physical strength. You might say

  a.weaponDamage(b) * a.atk / 10
 
Which adds 1 point of damage per 10 points in atk.
The weapon itself may provide atk bonus as well, but it is not necessary.

  -- Bare Hands --

Now, what happens when you don't have a weapon?
If no weapon is held, weapon damage is assumed to be "bare-hands" damage.

Bare-hands is set up as a weapon in your database. You don't need to actually
hold this in order to use the damage formula, but you could if you wanted to.

In the plugin manager, choose the ID of the weapon that will represent
bare-hands, and then set up the weapon damage formulas usual.

This damage formula will be used as the weapon damage.
-------------------------------------------------------------------------------
@param Bare-Hands Weapon ID
@desc The weapon in the database that represents bare-handed.
Use when a battler is not holding a weapon.
@default 1
-------------------------------------------------------------------------------
 */ 
var Imported = Imported || {} ;
var TH = TH || {};
Imported.TH_WeaponDamage = 1;
TH.WeaponDamage = TH.WeaponDamage || {};

(function ($) {

  $.Regex = /<weapon[-_ ]damage>([\s\S]*?)<\/weapon[-_ ]damage>/im
  
  $.params = PluginManager.parameters("HIME_WeaponDamage");
  $.barehandId = Math.floor($.params["Bare-Hands Weapon ID"]);
  
  Game_Battler.prototype.evalWeaponDamage = function(weapon, target) {
    if (weapon.damageFormula === undefined) {
      weapon.damageFormula = "0";
      
      var res = $.Regex.exec(weapon.note);
      if (res) {
        weapon.damageFormula = res[1];
      }
    }
    var a = this;
    var b = target;
    return eval(weapon.damageFormula);
  };
  
  Game_Battler.prototype.weaponDamage = function(target) {    
    var weapons = [];
    if (this.weapons) {
      weapons = this.weapons();
    }
    if (weapons.length === 0) {      
      return this.evalWeaponDamage($dataWeapons[$.barehandId], target);
    }
    else {
      var total = 0;
      for (var i = 0; i < weapons.length; i++) {
        total += this.evalWeaponDamage(weapons[i], target);
      }
      return total;
    }
  };
})(TH.WeaponDamage);